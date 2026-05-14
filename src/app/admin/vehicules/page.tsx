'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Vehicle, VehicleStatus, VehicleType } from "@/types";

export default function AdminVehiculesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Charger la liste au montage
  useEffect(() => {
    loadVehicles();
  }, []);

  function loadVehicles() {
    api.getVehicles().then(setVehicles);
  }

  // Soumission du formulaire d'ajout
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    await api.createVehicle({
      brand: fd.get("brand") as string,
      model: fd.get("model") as string,
      year: Number(fd.get("year")),
      mileage: Number(fd.get("mileage")),
      price: fd.get("price") ? Number(fd.get("price")) : undefined,
      monthlyPrice: fd.get("monthlyPrice") ? Number(fd.get("monthlyPrice")) : undefined,
      status: fd.get("status") as VehicleStatus,
      type: fd.get("type") as VehicleType,
      description: fd.get("description") as string,
    });

    setShowForm(false);
    e.currentTarget.reset();
    loadVehicles();
  }

  // Basculer un véhicule de location -> vente ou inversement
  async function basculer(v: Vehicle) {
    const nextStatus: VehicleStatus =
      v.status === "EN_LOCATION" ? "A_VENDRE" :
      v.status === "A_VENDRE" ? "EN_LOCATION" :
      "LES_DEUX";

    await api.basculerVehicle(v.id, nextStatus);
    loadVehicles();
  }

  // Supprimer
  async function supprimer(id: string) {
    if (!confirm("Confirmer la suppression ?")) return;
    await api.deleteVehicle(id);
    loadVehicles();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des véhicules</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? "Fermer" : "+ Ajouter un véhicule"}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 gap-4 border">
          <input name="brand" placeholder="Marque" required className="border rounded px-3 py-2" />
          <input name="model" placeholder="Modèle" required className="border rounded px-3 py-2" />
          <input name="year" placeholder="Année" type="number" required className="border rounded px-3 py-2" />
          <input name="mileage" placeholder="Kilométrage" type="number" required className="border rounded px-3 py-2" />
          <input name="price" placeholder="Prix vente (€)" type="number" className="border rounded px-3 py-2" />
          <input name="monthlyPrice" placeholder="Loyer mensuel (€)" type="number" className="border rounded px-3 py-2" />
          
          <select name="status" required className="border rounded px-3 py-2">
            <option value="A_VENDRE">À vendre</option>
            <option value="EN_LOCATION">En location</option>
            <option value="LES_DEUX">Les deux</option>
          </select>
          
          <select name="type" required className="border rounded px-3 py-2">
            <option value="ACHAT">Achat</option>
            <option value="LOCATION">Location</option>
            <option value="LES_DEUX">Achat / Location</option>
          </select>
          
          <textarea name="description" placeholder="Description..." className="col-span-2 border rounded px-3 py-2" />
          
          <div className="col-span-2">
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
              Enregistrer le véhicule
            </button>
          </div>
        </form>
      )}

      {/* Tableau des véhicules */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Véhicule</th>
              <th className="p-3">Statut stock</th>
              <th className="p-3">Offre</th>
              <th className="p-3">Prix / Loyer</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3 font-medium">{v.brand} {v.model} <span className="text-gray-400">({v.year})</span></td>
                <td className="p-3 text-center"><span className="px-2 py-1 rounded bg-gray-100">{v.status}</span></td>
                <td className="p-3 text-center">{v.type}</td>
                <td className="p-3 text-center">
                  {v.price ? `${v.price.toLocaleString()} €` : "-"} / {v.monthlyPrice ? `${v.monthlyPrice} €/m` : "-"}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => basculer(v)} className="text-blue-700 hover:underline text-xs">
                    Basculer
                  </button>
                  <button onClick={() => supprimer(v.id)} className="text-red-600 hover:underline text-xs">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
