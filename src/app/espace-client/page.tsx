'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Nouveau', icon: '⏳' },
  EN_REVISION: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'En révision', icon: '🔍' },
  VALIDE: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Accepté', icon: '✅' },
  REFUSE: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Refusé', icon: '❌' },
  SIGNE: { color: 'bg-slate-800 text-white border-slate-700', label: 'Signé', icon: '🎉' },
};


export default function EspaceClientPage() {
  const { user } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    api.getMyAppointments().then(setAppointments).catch(() => {});
  }, []);

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
                {/* MES RENDEZ-VOUS D'ESSAI */}
                <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Mes essais programmés</h2>
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚗</div>
                  <div>
                    <p className="font-bold text-slate-900">{a.vehicle.brand} {a.vehicle.model}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(a.dateTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {' '}
                      {new Date(a.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                      a.status === 'CONFIRME' ? 'bg-green-100 text-green-800' :
                      a.status === 'ANNULE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status === 'EN_ATTENTE' ? 'En attente de confirmation' :
                       a.status === 'CONFIRME' ? 'Confirmé' :
                       a.status === 'ANNULE' ? 'Annulé' : 'Terminé'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-gray-500">Aucun essai programmé.</p>}
          </div>
        </div>

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
                      <span className={`inline-flex items-center gap-1 mt-2 text-xs px-3 py-1.5 rounded-full font-bold border ${config.color}`}>
                        {config.icon} {config.label}
                        {d.status === 'VALIDE' && <span className="ml-1 animate-pulse">•</span>}
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
