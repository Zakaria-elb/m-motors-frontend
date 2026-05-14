'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { Dossier } from "@/types";

export default function EspaceClientPage() {
  // On récupère l'utilisateur connecté (pour dire "Bonjour Prénom")
  const { user } = useAuth();
  
  // On prépare une boîte vide pour stocker les dossiers reçus du serveur
  const [dossiers, setDossiers] = useState<Dossier[]>([]);

  // Au chargement de la page, on va chercher les dossiers de cet utilisateur
  useEffect(() => {
    api.getMyDossiers().then(setDossiers);
  }, []); // [] = exécuter UNE SEULE FOIS au démarrage

  // Petite palette de couleurs selon le statut du dossier
  const statusColor: Record<string, string> = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    EN_REVISION: "bg-blue-100 text-blue-800",
    VALIDE: "bg-green-100 text-green-800",
    REFUSE: "bg-red-100 text-red-800",
    SIGNE: "bg-slate-800 text-white",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Titre personnalisé avec le prénom */}
      <h1 className="text-2xl font-bold mb-2">Bonjour {user?.firstName} 👋</h1>
      <p className="text-gray-600 mb-8">Retrouvez ici tous vos dossiers d'achat et de location.</p>

      {/* Liste des dossiers */}
      <div className="space-y-4">
        {dossiers.map((d) => (
          <div
            key={d.id}
            className="bg-white p-5 rounded-lg shadow-sm border flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">
                {d.vehicle.brand} {d.vehicle.model}
              </h3>
              <p className="text-sm text-gray-600">
                {d.type === "ACHAT" ? "Achat" : "Location LLD"}
              </p>
              {/* Badge de statut coloré */}
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded font-medium ${
                  statusColor[d.status] || "bg-gray-100"
                }`}
              >
                {d.status}
              </span>
            </div>
            {/* Lien vers la page de suivi détaillé */}
            <Link
              href={`/espace-client/suivi/${d.id}`}
              className="text-blue-700 font-medium hover:underline"
            >
              Suivre l'avancement →
            </Link>
          </div>
        ))}

        {/* Message si aucun dossier */}
        {dossiers.length === 0 && (
          <p className="text-gray-500">Aucun dossier en cours.</p>
        )}
      </div>
    </div>
  );
}
