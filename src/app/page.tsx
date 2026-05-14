// ============================================
// PAGE D'ACCUEIL : Vitrine & Recherche de véhicules
// 'use client' = cette page est interactive (hooks React autorisés)
// ============================================

'use client';

import { useEffect, useState } from "react"; // useState = stocker des données / useEffect = action au chargement
import Link from "next/link";               // Link = navigation rapide sans rechargement de page
import { api } from "@/lib/api-client";    // Notre "facteur" pour parler au backend
import { Vehicle, VehicleType } from "@/types"; // Notre "dictionnaire" de données

export default function HomePage() {
  // --- ÉTAT (state) de la page ---
  // "vehicles" = la liste des voitures affichées. Au départ : tableau vide [].
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // "filter" = le filtre actif (TOUS, ACHAT, LOCATION). Au départ : "ALL".
  const [filter, setFilter] = useState<VehicleType | "ALL">("ALL");

  // --- CHARGEMENT DES DONNÉES ---
  // useEffect dit : "Exécute ce code UNE FOIS, au moment où le composant apparaît à l'écran"
  useEffect(() => {
    async function loadVehicles() {
      try {
        // Si le filtre est "ALL", on ne met pas de paramètre. Sinon on envoie ?type=ACHAT ou ?type=LOCATION
        const params = filter === "ALL" ? undefined : { type: filter };
        const data = await api.getVehicles(params);
        setVehicles(data); // On stocke les voitures reçues dans notre state
      } catch (error) {
        console.error("Erreur chargement véhicules:", error);
      }
    }
    loadVehicles();
  }, [filter]); // Le [filter] signifie : "Re-lance ce code SI 'filter' change"

  // Les 4 boutons de filtre
  const filters: { key: VehicleType | "ALL"; label: string }[] = [
    { key: "ALL", label: "Tous" },
    { key: "ACHAT", label: "Achat" },
    { key: "LOCATION", label: "Location" },
    { key: "LES_DEUX", label: "Achat / Location" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Titre */}
      <h1 className="text-3xl font-bold mb-2">Nos véhicules d'occasion</h1>
      <p className="text-gray-600 mb-6">
        Trouvez votre prochain véhicule, à acheter ou à louer en LLD.
      </p>

      {/* BARRE DE FILTRES */}
      <div className="flex gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)} // Au clic, on change le filtre → useEffect se déclenche
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              filter === f.key
                ? "bg-slate-900 text-white border-slate-900" // Style actif (sélectionné)
                : "bg-white text-slate-700 hover:bg-gray-100" // Style inactif
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* GRILLE DE VÉHICULES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition"
          >
            {/* Image (on prend la première, ou un placeholder si absente) */}
            <img
              src={v.imageUrls[0] || "/car-placeholder.jpg"}
              alt={`${v.brand} ${v.model}`}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold">{v.brand} {v.model}</h2>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {v.year}
                </span>
              </div>
              
              <p className="text-gray-500 text-sm mb-3">
                {v.mileage.toLocaleString()} km
              </p>
              
              {/* Prix ou Loyer */}
              <div className="mb-4">
                {v.price && (
                  <p className="text-xl font-bold text-blue-700">
                    {v.price.toLocaleString()} €
                  </p>
                )}
                {v.monthlyPrice && (
                  <p className="text-xl font-bold text-green-700">
                    {v.monthlyPrice} €/mois
                  </p>
                )}
              </div>
              
              {/* Bouton vers la fiche détaillée */}
              <Link
                href={`/vehicules/${v.id}`}
                className="block text-center bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
              >
                Voir la fiche
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message si aucun véhicule */}
      {vehicles.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Aucun véhicule disponible pour le moment.</p>
      )}
    </div>
  );
}
