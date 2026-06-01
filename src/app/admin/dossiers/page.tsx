'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Dossier, DossierStatus } from "@/types";

const statusBadge: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  EN_REVISION: 'bg-blue-100 text-blue-800 border-blue-200',
  VALIDE: 'bg-green-100 text-green-800 border-green-200',
  REFUSE: 'bg-red-100 text-red-800 border-red-200',
  SIGNE: 'bg-slate-800 text-white border-slate-700',
};

const filters = [
  { key: 'ALL' as const, label: 'Tous' },
  { key: 'EN_ATTENTE' as const, label: 'Nouveaux' },
  { key: 'EN_REVISION' as const, label: 'En révision' },
  { key: 'VALIDE' as const, label: 'Validés' },
  { key: 'REFUSE' as const, label: 'Refusés' },
];

export default function AdminDossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filter, setFilter] = useState<DossierStatus | 'ALL'>('ALL');

  function load() {
    const params = filter === 'ALL' ? undefined : { status: filter };
    api.getAllDossiers(params).then(setDossiers);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleValidation(id: string, status: DossierStatus) {
    let comment = '';
    if (status === 'REFUSE') {
      comment = prompt('Motif du refus (obligatoire) :') || '';
      if (!comment) return;
    } else if (status === 'VALIDE') {
      comment = prompt('Commentaire (optionnel) :') || '';
    }
    await api.validateDossier(id, status, comment);
    load();
  }

  const total = dossiers.length;
  const nouveaux = dossiers.filter(d => d.status === 'EN_ATTENTE').length;
  const enRevision = dossiers.filter(d => d.status === 'EN_REVISION').length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Total dossiers</p>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Nouveaux</p>
          <p className="text-2xl font-bold text-yellow-700">{nouveaux}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">En révision</p>
          <p className="text-2xl font-bold text-blue-700">{enRevision}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Validation des dossiers</h1>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
                    <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      filter === f.key
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                    {f.key !== 'ALL' && (
                      <span className="ml-1 text-xs opacity-75">
                        {dossiers.filter(d => d.status === f.key).length}
                      </span>
                    )}
                  </button>
        
        ))}
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-4">
        {dossiers.map((d) => (
          <div key={d.id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-bold text-lg text-slate-900">{d.vehicle.brand} {d.vehicle.model}</h3>
                <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold border ${statusBadge[d.status] || 'bg-gray-100 text-gray-700'}`}>
                  {d.status.replace(/_/g, ' ')}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {d.type === 'ACHAT' ? 'Achat' : 'Location LLD'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
              Client : <span className="font-medium">{d.user?.email || 'Inconnu'}</span>

                {' • '}Déposé le {new Date(d.createdAt).toLocaleDateString('fr-FR')}
              </p>
              {d.adminComment && (
                <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                  💬 {d.adminComment}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-start md:justify-end">
              {d.status === 'EN_ATTENTE' && (
                <button
                  onClick={() => handleValidation(d.id, 'EN_REVISION')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  📥 Prendre en charge
                </button>
              )}
              {d.status === 'EN_REVISION' && (
                <>
                  <button
                    onClick={() => handleValidation(d.id, 'VALIDE')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    ✅ Valider
                  </button>
                  <button
                    onClick={() => handleValidation(d.id, 'REFUSE')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    ❌ Refuser
                  </button>
                </>
              )}
              {d.status === 'VALIDE' && (
                <button
                  onClick={() => handleValidation(d.id, 'SIGNE')}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                >
                  ✍️ Marquer signé
                </button>
              )}
              {d.status === 'SIGNE' && (
                <span className="text-xs text-gray-500 py-2">Contrat finalisé</span>
              )}
            </div>
          </div>
        ))}

        {dossiers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-10 text-center">
            <p className="text-gray-400 text-lg">Aucun dossier à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
}
