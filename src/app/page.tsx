'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Vehicle, VehicleType } from '@/types';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<VehicleType | 'ALL'>('ALL');

  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    maxMileage: '',
  });

  const [searchError, setSearchError] = useState('');

  // Fonction de recherche principale
  const executeSearch = async () => {
    setLoading(true);
    setSearchError('');

    const params: Record<string, string> = {};

    if (filterType !== 'ALL') params.type = filterType;
    if (filters.brand.trim()) params.brand = filters.brand.trim();
    if (filters.model.trim()) params.model = filters.model.trim();
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.maxMileage) params.maxMileage = filters.maxMileage;

    // Validation fourchette prix
    if (params.minPrice && params.maxPrice && Number(params.minPrice) > Number(params.maxPrice)) {
      setSearchError('Le prix minimum ne peut pas être supérieur au prix maximum.');
      setVehicles([]);
      setLoading(false);
      return;
    }

    try {
      const result = await api.getVehicles(Object.keys(params).length ? params : undefined);
      setVehicles(result || []);
    } catch (err: any) {
      console.error('Erreur recherche véhicules:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Recherche automatique quand filtres/type changent
  useEffect(() => {
    const timeout = setTimeout(() => {
      executeSearch();
    }, 300); // petit debounce pour éviter trop d'appels
    return () => clearTimeout(timeout);
  }, [filterType, filters]);

  const typeButtons = [
    { key: 'ALL' as const, label: 'Tous' },
    { key: 'ACHAT' as VehicleType, label: 'Achat' },
    { key: 'LOCATION' as VehicleType, label: 'Location' },
    { key: 'LES_DEUX' as VehicleType, label: 'Achat / Location' },
  ];

  function handleReset() {
    setFilters({ brand: '', model: '', minPrice: '', maxPrice: '', maxMileage: '' });
    setFilterType('ALL');
    setSearchError('');
  }

  const hasActiveFilters =
    filterType !== 'ALL' ||
    filters.brand ||
    filters.model ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.maxMileage;

  const getImage = (v: Vehicle) => {
    if (v.imageUrls && v.imageUrls.length > 0) {
      const url = v.imageUrls[0];
      if (url.startsWith('http') || url.startsWith('/')) return url;
    }
    return `https://placehold.co/600x400/1e293b/FFF?text=${encodeURIComponent(v.brand + ' ' + v.model)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
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
            Achat ou location longue durée — des véhicules d'occasion garantis et révisés.
          </p>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* PANNEAU DE RECHERCHE */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recherche avancée</h2>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition"
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Marque (ex: Renault)"
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Modèle (ex: Clio)"
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Prix min (€)"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Prix max (€)"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Km max"
              value={filters.maxMileage}
              onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
              {searchError}
            </div>
          )}
        </div>

        {/* FILTRES TYPE */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
          {typeButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-200 ${
                filterType === f.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
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
                <div className="relative h-56 bg-gray-100 overflow-hidden group">
                  <img
                    src={getImage(v)}
                    alt={`${v.brand} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                        v.type === 'ACHAT'
                          ? 'bg-blue-100 text-blue-800'
                          : v.type === 'LOCATION'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {v.type === 'ACHAT' ? 'ACHAT' : v.type === 'LOCATION' ? 'LOCATION' : 'ACHAT / LOC'}
                    </span>
                  </div>
                </div>
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
                  <div className="mb-4">
                    {/* Achat uniquement : prix d'achat en grand */}
                    {v.type === 'ACHAT' && v.price && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">
                          {Number(v.price).toLocaleString()} €
                        </span>
                      </div>
                    )}

                    {/* Location uniquement : loyer en grand */}
                    {v.type === 'LOCATION' && v.monthlyPrice && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">
                          {Number(v.monthlyPrice).toLocaleString()} €/mois
                        </span>
                      </div>
                    )}

                    {/* Les deux : prix d'achat + loyer */}
                    {v.type === 'LES_DEUX' && (
                      <>
                        {v.price && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">
                              {Number(v.price).toLocaleString()} €
                            </span>
                          </div>
                        )}
                        {v.monthlyPrice && (
                          <div className="text-sm font-semibold text-gray-500">
                            ou {Number(v.monthlyPrice).toLocaleString()} €/mois en LLD
                          </div>
                        )}
                      </>
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

        {/* AUCUN RÉSULTAT */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🤷</div>
            <p className="text-gray-900 text-lg font-semibold mb-2">
              Aucun résultat ne correspond à vos critères
            </p>
            <p className="text-gray-500 mb-6">
              Essayez d'élargir votre recherche ou de modifier les filtres.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition font-medium"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
