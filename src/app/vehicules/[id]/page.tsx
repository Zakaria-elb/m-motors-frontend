'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types";
import { resolveImageUrl } from '@/lib/image-utils';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getVehicle(id as string)
      .then(setVehicle)
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Véhicule introuvable</h1>
          <p className="text-gray-600 mb-6">Ce véhicule n'existe plus ou a été vendu.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const getImage = () => {
    if (vehicle.imageUrls && vehicle.imageUrls.length > 0) {
      return resolveImageUrl(vehicle.imageUrls[0]);
    }
    return `https://placehold.co/800x500/1e293b/FFF?text=${encodeURIComponent(vehicle.brand + ' ' + vehicle.model)}`;
  };
  

  const badgeColor = () => {
    if (vehicle.type === 'ACHAT') return 'bg-blue-100 text-blue-800';
    if (vehicle.type === 'LOCATION') return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  const badgeText = () => {
    if (vehicle.type === 'ACHAT') return 'ACHAT';
    if (vehicle.type === 'LOCATION') return 'LOCATION';
    return 'ACHAT / LOCATION';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header avec image */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
            ← Retour aux véhicules
          </Link>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Image principale */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <img
                src={getImage()}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-80 md:h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-md ${badgeColor()}`}>
                  {badgeText()}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-slate-900 shadow-md">
                  {vehicle.year}
                </span>
              </div>
            </div>

            {/* Infos principales */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold">{vehicle.brand}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">{vehicle.model}</h1>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <span className="flex items-center gap-1">📅 {vehicle.year}</span>
                <span className="flex items-center gap-1">🛣️ {vehicle.mileage.toLocaleString()} km</span>
                <span className="flex items-center gap-1">🔋 {vehicle.status}</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                {vehicle.description}
              </p>

              {/* Bloc prix */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
              {vehicle.price && vehicle.type !== 'LOCATION' && (
  <div className="mb-3">
    <p className="text-sm text-gray-600 mb-1">Prix d'achat</p>
    <p className="text-4xl font-extrabold text-slate-900">{Number(vehicle.price).toLocaleString()} €</p>
  </div>
)}

{/* Loyer mensuel */}
{vehicle.monthlyPrice && vehicle.type !== 'ACHAT' && (
  <div>
    <p className="text-sm text-gray-600 mb-1">
      {vehicle.price && vehicle.type !== 'LOCATION' ? 'Ou en location longue durée' : 'Location longue durée'}
    </p>
    <p className={`font-extrabold ${vehicle.price && vehicle.type !== 'LOCATION' ? 'text-2xl text-slate-900' : 'text-4xl text-slate-900'}`}>
      {Number(vehicle.monthlyPrice).toLocaleString()} €/mois
    </p>
  </div>
)}
              </div>

              {/* Options */}
              {vehicle.options && Object.keys(vehicle.options).length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-slate-900 mb-3">Options incluses</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(vehicle.options)
                      .filter(([, v]) => v)
                      .map(([k]) => (
                        <span key={k} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                          ✅ {k.charAt(0).toUpperCase() + k.slice(1)}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                {vehicle.type !== 'LOCATION' && (
                  <button
                    onClick={() => router.push(`/depot-dossier?vehicleId=${vehicle.id}&type=ACHAT`)}
                    className="bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    🛒 Acheter
                  </button>
                )}
                {vehicle.type !== 'ACHAT' && (
                  <button
                    onClick={() => router.push(`/depot-dossier?vehicleId=${vehicle.id}&type=LOCATION`)}
                    className="bg-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    🔑 Louer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section confiance */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-bold text-slate-900 mb-1">Garantie mécanique</h3>
            <p className="text-sm text-gray-600">6 à 12 mois selon le véhicule</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="font-bold text-slate-900 mb-1">Entretien inclus</h3>
            <p className="text-sm text-gray-600">Révision complète avant livraison</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-bold text-slate-900 mb-1">Livraison possible</h3>
            <p className="text-sm text-gray-600">Chez vous ou en concession</p>
          </div>
        </div>
      </div>
    </div>
  );
}
