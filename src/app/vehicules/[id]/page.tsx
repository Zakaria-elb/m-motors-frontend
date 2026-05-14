'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types";

export default function VehicleDetailPage() {
  // useParams() récupère les morceaux dynamiques de l'URL.
  // Si l'URL est /vehicules/abc-123, alors id vaut "abc-123"
  const { id } = useParams();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de la page, on va chercher le véhicule correspondant à l'ID
  useEffect(() => {
    if (!id) return; // Sécurité : si pas d'id, on ne fait rien
    
    api.getVehicle(id as string)
      .then(setVehicle)     // Quand la réponse arrive, on la stocke dans "vehicle"
      .finally(() => setLoading(false)); // Dans tous les cas, on arrête le "chargement"
  }, [id]);

  // État "Chargement en cours..."
  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  // État "Véhicule introuvable" (si l'API renvoie une erreur ou rien)
  if (!vehicle) return <div className="p-10 text-center text-red-600">Véhicule introuvable</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Colonne de gauche : l'image */}
        <div>
          <img
            src={vehicle.imageUrls[0] || "/car-placeholder.jpg"}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full rounded-xl border"
          />
        </div>

        {/* Colonne de droite : les infos et les boutons d'action */}
        <div>
          <h1 className="text-3xl font-bold">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-gray-500 mt-1">
            {vehicle.year} • {vehicle.mileage.toLocaleString()} km
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <p><span className="font-medium">Disponibilité :</span> {vehicle.status}</p>
            <p>
              <span className="font-medium">Options incluses :</span>{" "}
              {Object.entries(vehicle.options || {})
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ") || "Aucune"}
            </p>
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">{vehicle.description}</p>

          {/* Bloc prix */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            {vehicle.price && (
              <p className="text-3xl font-bold text-slate-900">{vehicle.price.toLocaleString()} €</p>
            )}
            {vehicle.monthlyPrice && (
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {vehicle.monthlyPrice} €/mois
                <span className="text-sm font-normal text-gray-600 block">(location longue durée)</span>
              </p>
            )}
          </div>

          {/* Les deux gros boutons d'action métier */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link
              href={`/depot-dossier?vehicleId=${vehicle.id}&type=ACHAT`}
              className="text-center bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800"
            >
              Acheter ce véhicule
            </Link>
            <Link
              href={`/depot-dossier?vehicleId=${vehicle.id}&type=LOCATION`}
              className="text-center bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800"
            >
              Louer ce véhicule
            </Link>
          </div>

          <Link href="/" className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-800">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
}
