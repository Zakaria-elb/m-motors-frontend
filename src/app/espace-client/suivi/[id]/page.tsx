'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";


const timelineSteps: { status: DossierStatus; label: string; desc: string }[] = [
  { status: "BROUILLON", label: "Brouillon", desc: "Dossier initié" },
  { status: "EN_ATTENTE", label: "Dépôt", desc: "Documents envoyés" },
  { status: "EN_REVISION", label: "Instruction", desc: "Étude du dossier" },
  { status: "VALIDE", label: "Validation", desc: "Dossier accepté" },
  { status: "SIGNE", label: "Finalisation", desc: "Contrat signé" },
];

export default function SuiviPage() {
  const { id } = useParams();
  const [dossier, setDossier] = useState<Dossier | null>(null);

  const { user } = useAuth();

useEffect(() => {
  if (!user || !id) return;
  api.getDossier(id as string)
    .then(setDossier)
    .catch(() => setDossier(null));
}, [user, id]);


  if (!dossier) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const activeIndex = timelineSteps.findIndex((s) => s.status === dossier.status);
  const isRefused = dossier.status === "REFUSE";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/espace-client" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Retour à mes dossiers
        </Link>

        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
              {dossier.vehicle.imageUrls?.[0] ? (
                <img src={dossier.vehicle.imageUrls[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">🚗</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Suivi du dossier</h1>
              <p className="text-gray-600">{dossier.vehicle.brand} {dossier.vehicle.model} • {dossier.type === "ACHAT" ? "Achat" : "Location"}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-6">Avancement</h2>
          <div className="relative">
            {timelineSteps.map((step, idx) => {
              const done = idx <= activeIndex && !isRefused;
              const current = idx === activeIndex && !isRefused;

              return (
                <div key={step.status} className="flex gap-4 mb-6 last:mb-0 relative">
                  {/* Ligne verticale de connexion */}
                  {idx !== timelineSteps.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-full ${done ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  )}

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 border-2 ${done ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                    {done ? "✓" : idx + 1}
                  </div>

                  <div className={`pb-6 flex-1 ${current ? 'bg-green-50 rounded-lg p-3 -m-3 border border-green-200' : ''}`}>
                    <p className="font-bold text-slate-900">{step.label}</p>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                    {current && <p className="text-xs text-green-700 font-semibold mt-1">Statut actuel</p>}
                  </div>
                </div>
              );
            })}

            {isRefused && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-xl">
                <p className="font-bold text-red-800">Dossier refusé</p>
                <p className="text-sm text-red-700 mt-1">Motif : {dossier.adminComment || "Non précisé"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {dossier.documents && dossier.documents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold text-slate-900 mb-4">Documents transmis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dossier.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-2xl">📄</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
                    <p className="text-xs text-gray-500 uppercase">{doc.mimeType}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
