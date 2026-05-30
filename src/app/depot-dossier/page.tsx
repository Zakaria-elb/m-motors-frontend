'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { DossierType, Vehicle } from "@/types";
import Link from "next/link";

const REQUIRED_DOCS = [
  { 
    key: 'identity', 
    label: 'Pièce d\'identité', 
    desc: 'Carte Nationale d\'Identité ou Passeport (recto-verso)', 
    icon: '🪪', 
    accepted: '.pdf,.jpg,.jpeg,.png' 
  },
  { 
    key: 'domicile', 
    label: 'Justificatif de domicile', 
    desc: 'Facture d\'électricité, eau, gaz, ou quittance de loyer de moins de 3 mois', 
    icon: '🏠', 
    accepted: '.pdf,.jpg,.jpeg,.png' 
  },
  { 
    key: 'rib', 
    label: 'Relevé d\'Identité Bancaire', 
    desc: 'RIB au nom du futur titulaire du contrat', 
    icon: '🏦', 
    accepted: '.pdf,.jpg,.jpeg,.png' 
  },
  { 
    key: 'permis', 
    label: 'Permis de conduire', 
    desc: 'Permis valide (facultatif mais recommandé)', 
    icon: '📄', 
    accepted: '.pdf,.jpg,.jpeg,.png',
    optional: true 
  },
];

export default function DepotDossierPage() {
  const router = useRouter();
  
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<DossierType>("ACHAT");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Récupération URL + véhicule
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get("vehicleId");
    const t = (params.get("type") || "ACHAT") as DossierType;
    setVehicleId(vId);
    setType(t);
    if (vId) {
      api.getVehicle(vId).then(setVehicle).catch(() => setVehicle(null));
    }
  }, []);

  function handleFileSelect(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
      setError("");
    }
  }

  function removeFile(key: string) {
    setFiles(prev => ({ ...prev, [key]: null }));
  }

  function getFileIcon(file: File) {
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("image")) return "🖼️";
    return "📎";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId) return setError("Véhicule non sélectionné.");

    const requiredKeys = REQUIRED_DOCS.filter(d => !d.optional).map(d => d.key);
    const missing = requiredKeys.filter(k => !files[k]);
    if (missing.length > 0) {
      const names = missing.map(k => REQUIRED_DOCS.find(d => d.key === k)!.label).join(", ");
      return setError(`Documents manquants : ${names}`);
    }

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const dossier = await api.createDossier({ vehicleId, type });
      const allFiles = Object.values(files).filter((f): f is File => f !== null);

      for (let i = 0; i < allFiles.length; i++) {
        await api.uploadDocument(dossier.id, allFiles[i]);
        setProgress(Math.round(((i + 1) / allFiles.length) * 100));
      }

      setSuccess(true);
      setTimeout(() => router.push("/espace-client"), 2500);
    } catch (err: any) {
      setError(err.message || "Erreur lors du dépôt.");
    } finally {
      setUploading(false);
    }
  }

  // ─── Écran de succès ───
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Dossier déposé !</h2>
          <p className="text-gray-600 mb-6">
            Votre dossier de {type === "ACHAT" ? "achat" : "location"} a été envoyé avec succès.
            Notre équipe l'étudiera dans les plus brefs délais.
          </p>
          <p className="text-sm text-gray-500 mb-6">Redirection vers votre espace client...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const filledCount = Object.values(files).filter(Boolean).length;
  const requiredCount = REQUIRED_DOCS.filter(d => !d.optional).length;
  const totalCount = REQUIRED_DOCS.length;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-3 inline-block">
            ← Retour au catalogue
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Dépôt du dossier de {type === "ACHAT" ? "d'achat" : "de location"}
          </h1>
          <p className="text-gray-600 mt-1">
            Complétez les champs ci-dessous pour finaliser votre demande.
          </p>
        </div>

        {/* Récap véhicule */}
        {vehicle && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              {vehicle.imageUrls?.[0] ? (
                <img src={vehicle.imageUrls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{vehicle.brand}</p>
              <p className="text-lg font-bold text-slate-900">{vehicle.model} ({vehicle.year})</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-slate-900">
                {vehicle.price && type !== 'LOCATION' ? `${Number(vehicle.price).toLocaleString()} €` : ''}
                {vehicle.monthlyPrice && type !== 'ACHAT' ? `${Number(vehicle.monthlyPrice).toLocaleString()} €/mois` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Indicateur de progression */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Documents fournis : <span className="font-bold text-slate-900">{filledCount}/{requiredCount} obligatoires</span>
            {filledCount > requiredCount && ` (+${filledCount - requiredCount} optionnel)`}
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Formulaire d'upload */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {REQUIRED_DOCS.map((doc) => {
            const file = files[doc.key];
            const isUploaded = !!file;

            return (
              <div 
                key={doc.key} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${
                  isUploaded ? 'border-blue-300 ring-1 ring-blue-100' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl shrink-0">{doc.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{doc.label}</h3>
                        {!doc.optional && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            Obligatoire
                          </span>
                        )}
                        {doc.optional && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            Facultatif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{doc.desc}</p>
                    </div>
                  </div>

                  {!isUploaded ? (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-2xl mb-1 group-hover:scale-110 transition">☁️</div>
                        <p className="text-sm font-medium text-gray-700">Cliquez pour sélectionner</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG — Max 5 Mo</p>
                      </div>
                      <input
                        type="file"
                        accept={doc.accepted}
                        onChange={(e) => handleFileSelect(doc.key, e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} Ko • {file.type.split('/')[1].toUpperCase()}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(doc.key)}
                        disabled={uploading}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Barre de progression globale */}
          {uploading && (
            <div className="bg-white rounded-xl shadow-sm border p-5 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>📤 Envoi des documents en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Ne fermez pas cette page pendant le téléchargement.
              </p>
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                Envoi en cours...
              </>
            ) : (
              <>Envoyer mon dossier →</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
