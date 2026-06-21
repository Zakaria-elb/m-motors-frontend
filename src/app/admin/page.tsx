'use client';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Bloc Véhicules */}
        <Link href="/admin/vehicules" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl mb-3 group-hover:bg-slate-200 transition">🚙</div>
          <h2 className="text-lg font-bold text-slate-900">Gestion véhicules</h2>
          <p className="text-sm text-gray-600 mt-1">Ajouter, modifier, basculer les véhicules.</p>
        </Link>

        {/* Bloc Dossiers (Bleu) */}
        <Link href="/admin/dossiers" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group border-t-4 border-t-blue-600">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mb-3 group-hover:bg-blue-100 transition">📋</div>
          <h2 className="text-lg font-bold text-slate-900">Validation dossiers</h2>
          <p className="text-sm text-gray-600 mt-1">Instruire les demandes d'achat et de location.</p>
        </Link>

        {/* Bloc Essais (Orange) */}
        <Link href="/admin/appointments" className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group border-t-4 border-t-orange-500">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-2xl mb-3 group-hover:bg-orange-100 transition">🗓️</div>
          <h2 className="text-lg font-bold text-slate-900">Gestion des essais</h2>
          <p className="text-sm text-gray-600 mt-1">Confirmer ou annuler les rendez-vous client.</p>
        </Link>
      </div>
    </div>
  );
}
