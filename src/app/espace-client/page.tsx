'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

const statusConfig: Record<DossierStatus, { label: string; color: string; icon: string }> = {
  BROUILLON: { label: "Brouillon", color: "bg-gray-100 text-gray-700", icon: "📝" },
  EN_ATTENTE: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  EN_REVISION: { label: "En révision", color: "bg-blue-100 text-blue-800", icon: "🔍" },
  VALIDE: { label: "Validé", color: "bg-green-100 text-green-800", icon: "✅" },
  REFUSE: { label: "Refusé", color: "bg-red-100 text-red-800", icon: "❌" },
  SIGNE: { label: "Signé", color: "bg-slate-800 text-white", icon: "🎉" },
};

export default function EspaceClientPage() {
  const { user } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.getMyDossiers()
      .then((res) => setDossiers(res))
      .catch(() => setDossiers([])) // silencieux si token absent
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bonjour {user?.firstName} 👋</h1>
            <p className="text-gray-600">Voici l'avancement de vos dossiers chez M-Motors.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : dossiers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="text-5xl mb-4">📂</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Aucun dossier en cours</h2>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore déposé de dossier d'achat ou de location.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-500 transition">
              Parcourir les véhicules
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dossiers.map((d) => {
              const config = statusConfig[d.status];
              return (
                <div key={d.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {d.vehicle.imageUrls?.[0] ? (
                        <img src={d.vehicle.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{d.vehicle.brand} {d.vehicle.model}</h3>
                      <p className="text-sm text-gray-600">{d.type === "ACHAT" ? "Achat" : "Location LLD"} • Déposé le {new Date(d.createdAt).toLocaleDateString('fr-FR')}</p>
                      <span className={`inline-flex items-center gap-1 mt-2 text-xs px-3 py-1 rounded-full font-medium ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                    </div>
                  </div>
                  <Link href={`/espace-client/suivi/${d.id}`} className="shrink-0 text-blue-700 font-semibold hover:underline flex items-center gap-1">
                    Suivre l'avancement →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
