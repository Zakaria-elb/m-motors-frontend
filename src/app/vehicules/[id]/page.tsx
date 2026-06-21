'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Vehicle } from "@/types";
import { resolveImageUrl } from "@/lib/image-utils";
import { useAuth } from "@/providers/auth-provider";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth(); // ← TOUJOURS EN PREMIER

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEssaiForm, setShowEssaiForm] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentMsg, setAppointmentMsg] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
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
          <p className="text-6xl mb-4">🚗</p>
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

  const isAchat = vehicle.type === 'ACHAT' || vehicle.type === 'LES_DEUX';
  const isLocation = vehicle.type === 'LOCATION' || vehicle.type === 'LES_DEUX';

  async function handleBookTestDrive() {
    if (!appointmentDate || !appointmentTime) {
      setAppointmentMsg('Veuillez choisir une date et une heure.');
      return;
    }
    const dateTime = `${appointmentDate}T${appointmentTime}:00`;
    try {
      await api.createAppointment({ vehicleId: id as string, dateTime });
      setAppointmentMsg('Votre demande d\'essai a été envoyée ! Notre équipe vous confirmera le créneau.');
      setAppointmentDate('');
      setAppointmentTime('');
      setShowEssaiForm(false);
    } catch (err: any) {
      setAppointmentMsg(err.message || 'Erreur lors de la réservation.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header avec image et infos */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
            ← Retour aux véhicules
          </Link>

          <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-start">
            {/* Photo */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100">
              <img
                src={getImage()}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-[460px] md:h-[580px] object-cover"
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

            {/* Infos */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold">{vehicle.brand}</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">{vehicle.model}</h1>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-6 flex-wrap">
                <span>📅 {vehicle.year}</span>
                <span>🛣️ {vehicle.mileage.toLocaleString()} km</span>
                <span>🏷️ {vehicle.status.replace(/_/g, ' ')}</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                {vehicle.description || 'Véhicule proposé par M-Motors avec garantie et révision complète.'}
              </p>

              {/* Bloc prix */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
                {vehicle.type === 'ACHAT' && vehicle.price && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Prix d'achat</p>
                    <p className="text-4xl font-extrabold text-slate-900">{Number(vehicle.price).toLocaleString()} €</p>
                  </div>
                )}

                {vehicle.type === 'LOCATION' && vehicle.monthlyPrice && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location longue durée</p>
                    <p className="text-4xl font-extrabold text-slate-900">{Number(vehicle.monthlyPrice).toLocaleString()} €/mois</p>
                  </div>
                )}

                {vehicle.type === 'LES_DEUX' && (
                  <>
                    {vehicle.price && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Prix d'achat</p>
                        <p className="text-4xl font-extrabold text-slate-900">{Number(vehicle.price).toLocaleString()} €</p>
                      </div>
                    )}
                    {vehicle.monthlyPrice && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ou en location longue durée</p>
                        <p className="text-2xl font-extrabold text-slate-900">{Number(vehicle.monthlyPrice).toLocaleString()} €/mois</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Boutons d'action */}
              {!isAdmin ? (
                <div className={`grid gap-4 mt-auto ${vehicle.type === 'LES_DEUX' ? 'grid-cols-3' : 'grid-cols-2'}`}>
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
                  <button
                    type="button"
                    onClick={() => setShowEssaiForm(!showEssaiForm)}
                    className="bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    🚗 Essai
                  </button>
                </div>
              ) : (
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-700 font-medium">
                    👤 Compte administrateur : achat et location désactivés.
                  </p>
                </div>
              )}

              {/* Formulaire essai */}
              {!isAdmin && showEssaiForm && (
                <div className="mt-6 bg-orange-50 rounded-2xl p-5 border border-orange-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900">Choisir un créneau</h3>
                    <button
                      type="button"
                      onClick={() => setShowEssaiForm(false)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      ✕ Fermer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleBookTestDrive}
                    className="w-full bg-orange-700 text-white py-3 rounded-xl font-semibold hover:bg-orange-800 transition"
                  >
                    Confirmer la demande d'essai
                  </button>
                  {appointmentMsg && (
                    <p className={`mt-3 text-sm font-medium ${appointmentMsg.includes('envoyée') ? 'text-green-700' : 'text-red-600'}`}>
                      {appointmentMsg}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services et avantages */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Services et avantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {isAchat && (
            <>
              <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-blue-600">
                <div className="text-xl mb-1.5">💳</div>
                <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Facilité de paiement</h3>
                <p className="text-xs text-gray-600 leading-relaxed">Solutions de financement adaptées à votre budget.</p>
              </div>
              <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-green-600">
                <div className="text-xl mb-1.5">🚗</div>
                <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Reprise ancien véhicule</h3>
                <p className="text-xs text-gray-600 leading-relaxed">Estimation gratuite et reprise de votre ancienne voiture.</p>
              </div>
            </>
          )}

          {isLocation && (
            <>
              <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-orange-500">
                <div className="text-xl mb-1.5">🛠️</div>
                <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Assistance dépannage</h3>
                <p className="text-xs text-gray-600 leading-relaxed">Assistance 24h/24 et 7j/7 incluse avec votre LLD.</p>
              </div>
              <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-purple-600">
                <div className="text-xl mb-1.5">🔍</div>
                <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Contrôle technique</h3>
                <p className="text-xs text-gray-600 leading-relaxed">CT complet et vérifications avant mise à disposition.</p>
              </div>
              <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-teal-600">
                <div className="text-xl mb-1.5">🔧</div>
                <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Entretien régulier</h3>
                <p className="text-xs text-gray-600 leading-relaxed">Révisions et entretiens courants inclus.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Options incluses en bas : UNIQUEMENT EN LOCATION */}
      {isLocation && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Options incluses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-slate-800">
              <div className="text-xl mb-1.5">🛡️</div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Garantie mécanique</h3>
              <p className="text-xs text-gray-600 leading-relaxed">6 à 12 mois selon le véhicule</p>
            </div>
            <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-slate-800">
              <div className="text-xl mb-1.5">🔧</div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Entretien inclus</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Révision complète avant livraison</p>
            </div>
            <div className="bg-white rounded-lg p-3.5 shadow-sm border-l-4 border-l-slate-800">
              <div className="text-xl mb-1.5">🚚</div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-sm">Livraison possible</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Chez vous ou en concession</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
