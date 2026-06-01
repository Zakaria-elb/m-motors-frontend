'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Vehicle, VehicleType } from '@/types';
import { resolveImageUrl } from '@/lib/image-utils';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VehicleType | "ALL">("ALL");

  useEffect(() => {
    setLoading(true);
    const params = filter === "ALL" ? undefined : { type: filter };
    api.getVehicles(params)
      .then((res: Vehicle[]) => setVehicles(res))
      .finally(() => setLoading(false));
  }, [filter]);

  const filters: { key: VehicleType | "ALL"; label: string }[] = [
    { key: "ALL", label: "Tous" },
    { key: "ACHAT", label: "Achat" },
    { key: "LOCATION", label: "Location" },
    { key: "LES_DEUX", label: "Achat / Location" },
  ];




  const getImage = (v: Vehicle) => {
    if (v.imageUrls && v.imageUrls.length > 0) {
      return resolveImageUrl(v.imageUrls[0]);
    }
    return `https://placehold.co/600x400/1e293b/FFF?text=${encodeURIComponent(v.brand + ' ' + v.model)}`;
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80"
            alt="Showroom"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Votre prochain véhicule vous attend
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Achat ou location longue durée — des véhicules d'occasion garantis et révisés, livrés chez vous.
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* FILTRES */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                filter === f.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* CHARGEMENT */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* GRILLE */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden group">
                  <img
                    src={getImage(v)}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                      v.type === 'ACHAT' ? 'bg-blue-100 text-blue-800' :
                      v.type === 'LOCATION' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {v.type === 'ACHAT' ? 'ACHAT' : v.type === 'LOCATION' ? 'LOCATION' : 'ACHAT / LOC'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{v.brand} {v.model}</h2>
                      <p className="text-sm text-gray-500">{v.year} • {v.mileage.toLocaleString()} km</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {v.description || 'Véhicule proposé par M-Motors avec garantie et révision complète.'}
                  </p>

                  {/* Prix */}
                  <div className="mb-4">
  {/* Prix d'achat affiché sauf si LOCATION uniquement */}
  {v.price && v.type !== 'LOCATION' && (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{Number(v.price).toLocaleString()} €</span>
    </div>
  )}

  {/* Loyer affiché sauf si ACHAT uniquement */}
  {v.monthlyPrice && v.type !== 'ACHAT' && (
    <div className={`text-sm font-semibold ${v.price && v.type !== 'LOCATION' ? 'text-gray-500' : 'text-xl text-green-700'}`}>
      {v.price && v.type !== 'LOCATION' ? 'ou ' : ''}
      <span className={v.price && v.type !== 'LOCATION' ? '' : 'text-xl'}>{Number(v.monthlyPrice).toLocaleString()} €/mois</span>
      {v.price && v.type !== 'LOCATION' && <span className="font-normal text-gray-400"> en LLD</span>}
    </div>
  )}
</div>

                  <Link
                    href={`/vehicules/${v.id}`}
                    className="block text-center bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-md"
                  >
                    Voir la fiche →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun véhicule disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
