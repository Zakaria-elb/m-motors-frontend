'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { DossierType } from "@/types";

export default function DepotDossierPage() {
  const router = useRouter();

  // Au lieu de useSearchParams() (qui bloque le build),
  // on lit l'URL du navigateur directement dans useEffect
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [type, setType] = useState<DossierType>("ACHAT");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVehicleId(params.get("vehicleId"));
    setType((params.get("type") || "ACHAT") as DossierType);
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId) return alert("Véhicule non sélectionné");
    if (files.length === 0) return alert("Veuillez joindre les documents obligatoires");

    setUploading(true);
    try {
      const dossier = await api.createDossier({ vehicleId, type });
      for (const file of files) {
        await api.uploadDocument(dossier.id, file);
      }
      alert("Dossier déposé avec succès !");
      router.push("/espace-client");
    } catch (err: any) {
      alert(err.message || "Erreur lors du dépôt");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Déposer un dossier de {type === "ACHAT" ? "achat" : "location"}
      </h1>
      <p className="text-gray-600 mb-6">
        Veuillez joindre les pièces justificatives : CNI, justificatif de domicile, RIB.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white hover:border-blue-400 transition">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-4 text-xs text-gray-500">
            Formats : PDF, JPG, PNG — Max 5 Mo par fichier
          </p>

          {files.length > 0 && (
            <ul className="mt-4 text-left text-sm space-y-1 max-h-32 overflow-auto bg-gray-50 p-3 rounded">
              {files.map((f) => (
                <li key={f.name} className="flex justify-between text-gray-700">
                  <span>{f.name}</span>
                  <span className="text-gray-400">{(f.size / 1024).toFixed(0)} Ko</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || files.length === 0}
          className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? "Envoi en cours..." : "Envoyer mon dossier"}
        </button>
      </form>
    </div>
  );
}
