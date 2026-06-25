'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

const dossierStatusConfig: Record<DossierStatus, { label: string; color: string; icon: string }> = {
  BROUILLON:   { label: "Brouillon",     color: "bg-gray-100 text-gray-700",     icon: "✎" },
  EN_ATTENTE:  { label: "Nouveau",       color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  EN_REVISION: { label: "En révision",   color: "bg-blue-100 text-blue-800",    icon: "🔍" },
  VALIDE:      { label: "Accepté",       color: "bg-green-100 text-green-800",  icon: "✓" },
  REFUSE:      { label: "Refusé",        color: "bg-red-100 text-red-800",      icon: "✕" },
  SIGNE:       { label: "Signé",         color: "bg-slate-800 text-white",      icon: "✓" },
};

const appointmentStatusConfig: Record<string, { label: string; color: string; icon: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-amber-100 text-amber-800", icon: "⏳" },
  CONFIRME:   { label: "Confirmé",   color: "bg-green-100 text-green-800", icon: "✓" },
  ANNULE:     { label: "Annulé",     color: "bg-red-100 text-red-800",     icon: "✕" },
  TERMINE:    { label: "Terminé",    color: "bg-gray-100 text-gray-600",   icon: "✓" },
};

export default function EspaceClientPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Si admin, redirection immédiate vers le back-office
    if (user?.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }

    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    Promise.all([
      api.getMyDossiers().then(setDossiers).catch(() => setDossiers([])),
      api.getMyAppointments().then(setAppointments).catch(() => setAppointments([])),
    ]).finally(() => setDataLoading(false));
  }, [authLoading, user, router]);

  //  global
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Connexion requise</h1>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à votre espace.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bonjour {user.firstName} 👋</h1>
            <p className="text-gray-600">Voici l'avancement de vos démarches chez M-Motors.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MES DOSSIERS */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-bold">Mes dossiers</h2>
                  <p className="text-blue-100 text-sm">Achat & Location LLD</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-bold">
                {dossiers.length}
              </span>
            </div>
            <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto">
              {dossiers.map((d) => {
                const cfg = dossierStatusConfig[d.status];
                return (
                  <div key={d.id} className="border rounded-xl p-4 hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-900">{d.vehicle.brand} {d.vehicle.model}</h3>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {d.type === "ACHAT" ? "Achat" : "Location LLD"} • Déposé le {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Link href={`/espace-client/suivi/${d.id}`} className="text-blue-700 text-sm font-semibold hover:underline whitespace-nowrap">
                        Suivre →
                      </Link>
                    </div>
                  </div>
                );
              })}
              {dossiers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500">Aucun dossier en cours.</p>
                  <Link href="/" className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline">
                    Parcourir les véhicules
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* MES ESSAIS */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">🚗</span>
                <div>
                  <h2 className="text-lg font-bold">Mes essais</h2>
                  <p className="text-orange-100 text-sm">Réservations de rendez-vous</p>
                </div>
              </div>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-bold">
                {appointments.length}
              </span>
            </div>
            <div className="p-5 space-y-3 max-h-[520px] overflow-y-auto">
              {appointments.map((a) => {
                const cfg = appointmentStatusConfig[a.status] || appointmentStatusConfig.TERMINE;
                return (
                  <div key={a.id} className="border rounded-xl p-4 hover:shadow-md transition bg-white border-l-4 border-l-orange-400">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-slate-900">{a.vehicle?.brand} {a.vehicle?.model}</h3>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(a.dateTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {' '}
                          {new Date(a.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🗓️</div>
                  <p className="text-gray-500">Aucun essai programmé.</p>
                  <Link href="/" className="mt-3 inline-block text-orange-600 text-sm font-medium hover:underline">
                    Réserver un essai
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
