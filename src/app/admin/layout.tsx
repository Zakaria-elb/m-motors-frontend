'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirection 
  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">🚫</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">Vous devez être administrateur pour accéder à cette page.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="text-lg font-bold mb-8 px-2">M-Motors Admin</div>
        <nav className="space-y-2">
  <Link href="/admin/vehicules" className="block px-3 py-2 rounded hover:bg-slate-700">
    🚙 Gestion Véhicules
  </Link>
  <Link href="/admin/dossiers" className="block px-3 py-2 rounded hover:bg-slate-700">
    📋 Validation Dossiers
  </Link>
  <Link href="/admin/appointments" className="block px-3 py-2 rounded hover:bg-slate-700">
    🗓️ Rendez-vous d'essai
  </Link>
</nav>

        <div className="mt-auto pt-4 border-t border-slate-700 px-3 text-xs text-slate-400">
          Connecté : {user.email}
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
