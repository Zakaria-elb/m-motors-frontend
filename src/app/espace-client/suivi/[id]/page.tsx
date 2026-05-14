'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

// Les 5 étapes fixes de la vie d'un dossier, dans l'ordre chronologique
const timelineSteps: { status: DossierStatus; label: string; desc: string }[] = [
  { status: "BROUILLON", label: "Brouillon", desc: "Dossier initié" },
  { status: "EN_ATTENTE", label: "Dépôt", desc: "Documents envoyés" },
  { status: "EN_REVISION", label: "Instruction", desc: "Étude du dossier" },
  { status: "VALIDE", label: "Validation", desc: "Dossier accepté" },
  { status: "SIGNE", label: "Finalisation", desc: "Contrat signé" },
];

export default function SuiviPage() {
  const { id } = useParams(); // Récupère l'ID du dossier dans l'URL
  const [dossier, setDossier] = useState<Dossier | null>(null);

  // Va chercher les détails du dossier au chargement
  useEffect(() => {
    if (id) api.getDossier(id as string).then(setDossier);
  }, [id]);

  if (!dossier) return <div className="p-10 text-center">Chargement...</div>;

  // On cherche à quel index se trouve le statut actuel du dossier
  const activeIndex = timelineSteps.findIndex((s) => s.status === dossier.status);
  const isRefused = dossier.status === "REFUSE";

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Lien retour */}
      <Link href="/espace-client" className="text-sm text-blue-600 hover:underline">
        ← Retour
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-1">Suivi de votre dossier</h1>
      <p className="text-gray-600 mb-8">
        {dossier.vehicle.brand} {dossier.vehicle.model}
      </p>

      {/* TIMELINE */}
      <div className="relative space-y-6">
        {timelineSteps.map((step, idx) => {
          // Une étape est "faite" si son index est <= l'index actuel
          const done = idx <= activeIndex && !isRefused;
          // C'est l'étape en cours si c'est exactement l'index actuel
          const current = idx === activeIndex && !isRefused;

          return (
            <div
              key={step.status}
              className={`flex gap-4 items-start p-4 rounded-lg border-l-4 ${
                done
                  ? "bg-green-50 border-green-600"
                  : "bg-gray-50 border-gray-300"
              } ${current ? "ring-2 ring-green-200" : ""}`}
            >
              {/* Cercle numéroté ou check vert */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  done ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                {done ? "✓" : idx + 1}
              </div>

              {/* Texte de l'étape */}
              <div>
                <p className="font-bold">{step.label}</p>
                <p className="text-sm text-gray-600">{step.desc}</p>
                {current && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    Statut actuel
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Si le dossier est refusé, on affiche un bloc rouge en bas */}
        {isRefused && (
          <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
            <p className="font-bold text-red-800">Dossier refusé</p>
            <p className="text-sm text-red-700 mt-1">
              Motif : {dossier.adminComment || "Non précisé"}
            </p>
          </div>
        )}
      </div>

      {/* Liste des documents transmis */}
      {dossier.documents && dossier.documents.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Documents transmis</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {dossier.documents.map((doc) => (
              <li key={doc.id}>{doc.originalName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
