'use client';
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import Link from "next/link";

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'En attente', icon: '⏳' },
  CONFIRME:   { color: 'bg-green-100 text-green-800 border-green-200',   label: 'Confirmé',  icon: '✓' },
  ANNULE:     { color: 'bg-red-100 text-red-800 border-red-200',       label: 'Annulé',    icon: '✕' },
  TERMINE:    { color: 'bg-gray-100 text-gray-600 border-gray-200',    label: 'Terminé',   icon: '✓' },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => { load(); }, []);

  function load() {
    api.getAdminAppointments().then(setAppointments).catch(() => {});
  }

  async function handleStatus(id: string, status: string) {
    let comment = '';
    if (status === 'ANNULE') {
      comment = prompt('Motif de l\'annulation (optionnel) :') || '';
    }
    await api.updateAppointmentStatus(id, status, comment || undefined);
    load();
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);

  const filters = [
    { key: 'ALL', label: 'Tous' },
    { key: 'EN_ATTENTE', label: 'En attente' },
    { key: 'CONFIRME', label: 'Confirmés' },
    { key: 'ANNULE', label: 'Annulés' },
    { key: 'TERMINE', label: 'Terminés' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Total essais</p>
          <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-yellow-700">{appointments.filter(a => a.status === 'EN_ATTENTE').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Confirmés</p>
          <p className="text-2xl font-bold text-green-700">{appointments.filter(a => a.status === 'CONFIRME').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-gray-700">{appointments.filter(a => a.status === 'TERMINE').length}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestion des essais</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === f.key ? 'bg-slate-900 text-white shadow-md' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((a) => {
          const cfg = statusConfig[a.status] || statusConfig.TERMINE;
          return (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg text-slate-900">
                    {a.vehicle?.brand} {a.vehicle?.model}
                  </h3>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold border ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Client : <span className="font-medium">{a.user?.firstName} {a.user?.lastName}</span> ({a.user?.email})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Date : <span className="font-medium">
                    {new Date(a.dateTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' '}à{' '}
                    {new Date(a.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
                {a.comment && (
                  <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                    {a.comment}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-start md:justify-end">
                {a.status === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => handleStatus(a.id, 'CONFIRME')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      ✓ Confirmer
                    </button>
                    <button
                      onClick={() => handleStatus(a.id, 'ANNULE')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                    >
                      ✕ Annuler
                    </button>
                  </>
                )}
                {a.status === 'CONFIRME' && (
                  <button
                    onClick={() => handleStatus(a.id, 'TERMINE')}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                  >
                    Marquer terminé
                  </button>
                )}
                {a.status === 'TERMINE' && (
                  <span className="text-xs text-gray-500 py-2">Essai réalisé</span>
                )}
                {a.status === 'ANNULE' && (
                  <span className="text-xs text-red-500 py-2">Essai annulé</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-10 text-center">
            <p className="text-gray-400 text-lg">Aucun essai à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
}
