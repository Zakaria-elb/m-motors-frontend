'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

export default function AdminDossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filter, setFilter] = useState<DossierStatus | "ALL">("ALL");

  function load() {
    const params = filter === "ALL" ? undefined : { status: filter };
    api.getAllDossiers(params).then(setDossiers);
  }

  useEffect(() => {
    load();
  }, [filter]);

  // Action de validation ou refus
  async function handleValidation(id: string, status: DossierStatus) {
    let comment = "";
    if (status === "REFUSE") {
      comment = prompt("Motif du refus (obligatoire) :") || "";
      if (!comment) return; // Annuler si pas de motif
    } else if (status === "VALIDE") {
      comment = prompt("Commentaire (optionnel) :") || "";
    }

    await api.validateDossier(id, status, comment);
    load();
  }

  const statusBadge: Record<string, string> = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    EN_REVISION: "bg-blue-100 text-blue-800",
    VALIDE: "bg-green-100 text-green-800",
    REFUSE: "bg-red-100 text-red-800",
    SIGNE: "bg-slate-800 text-white",
  };

  const filters = [
    { key: "ALL" as const, label: "Tous" },
    { key: "EN_ATTENTE" as const, label: "Nouveaux" },
    { key: "EN_REVISION" as const, label: "En révision" },
    { key: "VALIDE" as const, label: "Validés" },
    { key: "REFUSE" as const, label: "Refusés" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Validation des dossiers</h1>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === f.key ? "bg-slate-900 text-white" : "bg-white border hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-4">
        {dossiers.map((d) => (
          <div key={d.id} className="bg-white p-5 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold">{d.vehicle.brand} {d.vehicle.model}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusBadge[d.status] || "bg-gray-100"}`}>
                  {d.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                 Type : {d.type === "ACHAT" ? "Achat" : "Location LLD"} • {d.vehicle.brand} {d.vehicle.model}
              </p>

              {d.adminComment && <p className="text-sm text-red-600 mt-2">📝 {d.adminComment}</p>}
            </div>

            <div className="flex flex-wrap gap-2 items-start">
              {d.status === "EN_ATTENTE" && (
                <button onClick={() => handleValidation(d.id, "EN_REVISION")} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                  Prendre en charge
                </button>
              )}
              {d.status === "EN_REVISION" && (
                <>
                  <button onClick={() => handleValidation(d.id, "VALIDE")} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
                    Valider
                  </button>
                  <button onClick={() => handleValidation(d.id, "REFUSE")} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
                    Refuser
                  </button>
                </>
              )}
              {d.status === "VALIDE" && (
                <button onClick={() => handleValidation(d.id, "SIGNE")} className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-700">
                  Marquer signé
                </button>
              )}
            </div>
          </div>
        ))}
        {dossiers.length === 0 && <p className="text-gray-500">Aucun dossier à afficher.</p>}
      </div>
    </div>
  );
}
