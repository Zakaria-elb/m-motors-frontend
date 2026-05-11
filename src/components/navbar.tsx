'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide">M-Motors</Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-300">Véhicules</Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && <Link href="/admin" className="hover:text-blue-300">Admin</Link>}
              <Link href="/espace-client" className="hover:text-blue-300">Mon Espace</Link>
              <button onClick={logout} className="text-red-300 hover:text-red-100">Déconnexion</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-300">Connexion</Link>
              <Link href="/register" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
