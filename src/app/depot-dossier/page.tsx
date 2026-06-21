'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { DossierType } from "@/types";
import Link from "next/link";
import { useAuth } from '@/providers/auth-provider';


const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const REQUIRED_DOCS = [
  { key: 'identity', label: "Pièce d'identité", desc: 'CNI ou Passeport (recto-verso)', icon: '🆔' },
  { key: 'domicile', label: 'Justificatif de domicile', desc: 'Facture élec/gaz/eau ou quittance < 3 mois', icon: '🏠' },
  { key: 'rib', label: 'Relevé Identité Bancaire', desc: 'RIB au nom du futur titulaire', icon: '🏦' },
  { key: 'permis', label: 'Permis de conduire', desc: 'Facultatif mais recommandé', icon: '🚗', optional: true },
];

export default function DepotDossierPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<DossierType>("ACHAT");

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({}); // Erreur par champ
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVehicleId(params.get("vehicleId"));
    setType((params.get("type") || "ACHAT") as DossierType);
  }, []);

  function handleFileSelect(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    // Reset l'erreur de ce champ
    setFileErrors(prev => ({ ...prev, [key]: '' }));

    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    // 🔒 VALIDATION 1 : type MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileErrors(prev => ({ ...prev, [key]: `❌ "${file.name}" : format non autorisé (PDF, JPG, PNG uniquement)` }));
      e.target.value = ''; // reset l'input
      return;
    }

    // 🔒 VALIDATION 2 : taille max 20 Mo
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors(prev => ({ ...prev, [key]: `❌ "${file.name}" fait ${(file.size / 1024 / 1024).toFixed(1)} Mo (max 20 Mo)` }));
      e.target.value = ''; // reset l'input
      return;
    }

    // ✅ Tout est bon, on stocke
    setFiles(prev => ({ ...prev, [key]: file }));
  }

  function removeFile(key: string) {
    setFiles(prev => ({ ...prev, [key]: null }));
    setFileErrors(prev => ({ ...prev, [key]: '' }));
  }

  function getFileIcon(file: File) {
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("image")) return "🖼️";
    return "📎";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId) return setSubmitError("Véhicule non sélectionné.");

    const requiredKeys = REQUIRED_DOCS.filter(d => !d.optional).map(d => d.key);
    const missing = requiredKeys.filter(k => !files[k]);
    if (missing.length > 0) {
      return setSubmitError(`Documents manquants : ${missing.map(k => REQUIRED_DOCS.find(d => d.key === k)!.label).join(", ")}`);
    }

    // Vérification finale (sécurité)
    const allFiles = Object.values(files).filter((f): f is File => f !== null);
    for (const file of allFiles) {
      if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(file.type)) {
        return setSubmitError(`"${file.name}" est invalide. Veuillez le remplacer.`);
      }
    }

    setUploading(true);
    setProgress(0);
    setSubmitError("");

    let createdDossierId: string | null = null;

    try {
      const dossier = await api.createDossier({ vehicleId, type });
      createdDossierId = dossier.id;

      for (let i = 0; i < allFiles.length; i++) {
        await api.uploadDocument(dossier.id, allFiles[i]);
        setProgress(Math.round(((i + 1) / allFiles.length) * 100));
      }

      router.push("/espace-client");
    } catch (err: any) {
      setSubmitError(err.message || "Erreur lors du dépôt.");
      if (createdDossierId) {
        try { await api.deleteDossier(createdDossierId); } catch {}
      }
    } finally {
      setUploading(false);
    }
  }
  
 

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

if (user?.role === 'ADMIN') {
  router.replace('/');
  return null;
}

  const filledCount = Object.values(files).filter(Boolean).length;
  const requiredCount = REQUIRED_DOCS.filter(d => !d.optional).length;
  const allValid = filledCount >= requiredCount && Object.values(fileErrors).every(e => !e);
   
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
        <Link
             href={vehicleId ? `/vehicules/${vehicleId}` : '/'} className="text-sm text-blue-600 hover:underline mb-3 inline-block">
        ← Retour à la fiche du véhicule
        </Link>

          <h1 className="text-2xl font-bold text-slate-900">Dépôt du dossier de {type === "ACHAT" ? "d'achat" : "de location"}</h1>
          <p className="text-gray-600 mt-1">Complétez les champs ci-dessous pour finaliser votre demande.</p>
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {REQUIRED_DOCS.map((doc) => {
            const file = files[doc.key];
            const isUploaded = !!file;
            const fieldError = fileErrors[doc.key];

            return (
              <div key={doc.key} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition ${isUploaded ? 'border-blue-300 ring-1 ring-blue-100' : ''}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl shrink-0">{doc.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{doc.label}</h3>
                        {!doc.optional && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Obligatoire</span>}
                        {doc.optional && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Facultatif</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{doc.desc}</p>
                    </div>
                  </div>

                  {/* Zone d'upload ou fichier validé */}
                  {!isUploaded ? (
                    <div>
                      <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg bg-gray-50 transition cursor-pointer group ${fieldError ? 'border-red-400 bg-red-50 hover:bg-red-100' : 'border-gray-300 hover:bg-blue-50 hover:border-blue-400'}`}>
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-2xl mb-1 group-hover:scale-110 transition">☁️</div>
                          <p className="text-sm font-medium text-gray-700">Cliquez pour sélectionner</p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG — Max 20 Mo</p>
                        </div>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect(doc.key, e)} className="hidden" disabled={uploading} />
                      </label>

                      {/* Message d'erreur sous le champ */}
                      {fieldError && (
                        <p className="mt-2 text-sm text-red-600 font-medium">{fieldError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} Ko</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(doc.key)} disabled={uploading} className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition disabled:opacity-50">
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {uploading && (
            <div className="bg-white rounded-xl shadow-sm border p-5 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>⏳ Envoi en cours ({filledCount} fichiers)...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !allValid}
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
