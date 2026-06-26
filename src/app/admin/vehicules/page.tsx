'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Vehicle, VehicleStatus, VehicleType } from "@/types";

const statusBadge: Record<string, string> = {
  A_VENDRE: 'bg-green-100 text-green-800',
  EN_LOCATION: 'bg-blue-100 text-blue-800',
  LES_DEUX: 'bg-purple-100 text-purple-800',
  VENDU: 'bg-gray-100 text-gray-500',
  LOUE: 'bg-gray-100 text-gray-500',
};

export default function AdminVehiculesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadVehicles(); }, []);

  function loadVehicles() {
    api.getVehicles().then(setVehicles);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await api.createVehicleForm(fd);
      setShowForm(false);
      form.reset();
      loadVehicles();
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'ajout");
    }
  }

  async function basculer(v: Vehicle) {
    // Menu de choix du nouveau statut
    const choix = prompt(
      `Basculement de ${v.brand} ${v.model}\n\n` +
      `Choisissez le nouveau statut :\n` +
      `1 - Vente seule (A_VENDRE)\n` +
      `2 - Location seule (EN_LOCATION)\n` +
      `3 - Les deux (LES_DEUX)\n\n` +
      `Tapez 1, 2 ou 3 :`
    );
  
    if (!choix || !['1', '2', '3'].includes(choix)) {
      return alert('Basculement annulé.');
    }
  
    const nextStatusMap: Record<string, VehicleStatus> = {
      '1': 'A_VENDRE',
      '2': 'EN_LOCATION',
      '3': 'LES_DEUX',
    };
  
    const nextStatus = nextStatusMap[choix];
    const extra: { price?: number; monthlyPrice?: number } = {};
  
    // Si on va vers VENTE ou LES_DEUX, il faut un prix d'achat
    if ((nextStatus === 'A_VENDRE' || nextStatus === 'LES_DEUX') && (!v.price || v.price === 0)) {
      const priceStr = prompt(
        `Basculement vers ${nextStatus === 'A_VENDRE' ? 'Vente seule' : 'Les deux'}\n\n` +
        `Ce véhicule n'a pas de prix d'achat.\nVeuillez le renseigner (€) :`
      );
      if (!priceStr || isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
        return alert('Basculement annulé : prix d\'achat invalide.');
      }
      extra.price = Number(priceStr);
    }
  
    // ajout un loyer mensuel au bascule
    
    if ((nextStatus === 'EN_LOCATION' || nextStatus === 'LES_DEUX') && (!v.monthlyPrice || v.monthlyPrice === 0)) {
      const monthlyStr = prompt(
        `Basculement vers ${nextStatus === 'EN_LOCATION' ? 'Location seule' : 'Les deux'}\n\n` +
        `Ce véhicule n'a pas de loyer mensuel.\nVeuillez le renseigner (€/mois) :`
      );
      if (!monthlyStr || isNaN(Number(monthlyStr)) || Number(monthlyStr) <= 0) {
        return alert('Basculement annulé : loyer mensuel invalide.');
      }
      extra.monthlyPrice = Number(monthlyStr);
    }
  
    await api.basculerVehicle(v.id, nextStatus, extra);
    loadVehicles();
  }
  

  async function supprimer(id: string) {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      await api.deleteVehicle(id);
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  }
  

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">Total véhicules</p>
          <p className="text-2xl font-bold text-slate-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">À vendre</p>
          <p className="text-2xl font-bold text-green-700">{vehicles.filter(v => v.status === 'A_VENDRE' || v.status === 'LES_DEUX').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-sm text-gray-600">En location</p>
          <p className="text-2xl font-bold text-blue-700">{vehicles.filter(v => v.status === 'EN_LOCATION' || v.status === 'LES_DEUX').length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestion des véhicules</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
        >
          {showForm ? '✕ Fermer' : '＋ Ajouter un véhicule'}
        </button>
      </div>

      {/* Formulaire avec upload */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="brand" placeholder="Marque *" required className="border rounded-lg px-3 py-2" />
          <input name="model" placeholder="Modèle *" required className="border rounded-lg px-3 py-2" />
          <input name="year" placeholder="Année *" type="number" required className="border rounded-lg px-3 py-2" />
          <input name="mileage" placeholder="Kilométrage *" type="number" required className="border rounded-lg px-3 py-2" />
          <input name="price" placeholder="Prix vente (€)" type="number" className="border rounded-lg px-3 py-2" />
          <input name="monthlyPrice" placeholder="Loyer mensuel (€)" type="number" className="border rounded-lg px-3 py-2" />
          
          <select name="status" required className="border rounded-lg px-3 py-2">
            <option value="A_VENDRE">À vendre</option>
            <option value="EN_LOCATION">En location</option>
            <option value="LES_DEUX">Les deux</option>
          </select>
          
          <select name="type" required className="border rounded-lg px-3 py-2">
            <option value="ACHAT">Achat</option>
            <option value="LOCATION">Location</option>
            <option value="LES_DEUX">Achat / Location</option>
          </select>

          {/* CHAMP UPLOAD FICHIER */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo du véhicule <span className="text-red-500">*</span></label>
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Sélectionnez une photo depuis votre Mac (JPG, PNG, WEBP).</p>
          </div>

          <textarea name="description" placeholder="Description..." className="md:col-span-2 border rounded-lg px-3 py-2" rows={3} />
          
          <p className="text-xs text-gray-500 md:col-span-2">
            ℹ️ Les prix sont optionnels à la création. Ils seront demandés lors du basculement si manquants.
          </p>
          
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-medium">
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="text-left p-3 font-medium">Véhicule</th>
                <th className="p-3 font-medium text-center">Année</th>
                <th className="p-3 font-medium text-center">Statut stock</th>
                <th className="p-3 font-medium text-center">Offre</th>
                <th className="p-3 font-medium text-right">Prix / Loyer</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                        {v.imageUrls?.[0] ? (
                          <img 
                            src={v.imageUrls[0]} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : 'Ý'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{v.brand} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center text-gray-700">{v.year}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${statusBadge[v.status] || 'bg-gray-100 text-gray-700'}`}>
                      {v.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-700">{v.type.replace(/_/g, ' ')}</td>
                  <td className="p-3 text-right">
                    {v.price && v.type !== 'LOCATION' && (
                      <p className="font-bold text-slate-900">{Number(v.price).toLocaleString()} €</p>
                    )}
                    {v.monthlyPrice && v.type !== 'ACHAT' && (
                      <p className="text-xs font-medium text-gray-600">{Number(v.monthlyPrice).toLocaleString()} €/mois</p>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => basculer(v)} 
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded hover:bg-blue-100 transition font-medium"
                        title="Basculer le statut"
                      >
                        ↔ Basculer
                      </button>
                      <button 
                        onClick={() => supprimer(v.id)} 
                        className="text-xs bg-red-50 text-red-700 px-2 py-1.5 rounded hover:bg-red-100 transition font-medium"
                        title="Supprimer"
                      >
                        🗑 Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Aucun véhicule enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
