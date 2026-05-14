'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Si pas encore chargé, on attend
  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  // Si pas connecté ou pas admin, on redirige
  if (!user || user.role !== 'ADMIN') {
    router.push('/');
    return <div className="p-10 text-center">Accès refusé...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Barre latérale */}
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="text-lg font-bold mb-8 px-2">M-Motors Admin</div>
        
        <nav className="space-y-2">
          <Link href="/admin/vehicules" className="block px-3 py-2 rounded hover:bg-slate-700">
            Gestion Véhicules
          </Link>
          <Link href="/admin/dossiers" className="block px-3 py-2 rounded hover:bg-slate-700">
            Validation Dossiers
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-700 px-3 text-xs text-slate-400">
          Connecté : {user.email}
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
