'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      pathname === href
        ? 'text-blue-300 bg-slate-800'
        : 'text-gray-300 hover:text-white hover:bg-slate-700'
    }`;

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            
            <span className="text-2xl">🚗</span>
            <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-300 transition">
              M-Motors
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={linkClass('/')}>Véhicules</Link>
            
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className={linkClass('/admin')}>Admin</Link>
                )}
                <Link href="/espace-client" className={linkClass('/espace-client')}>
                  Mon Espace
                </Link>
                <div className="ml-4 flex items-center gap-3 border-l border-slate-700 pl-4">
                  <span className="text-xs text-gray-400">{user.firstName}</span>
                  <button
                    onClick={logout}
                    className="text-sm bg-red-600/20 text-red-300 border border-red-600/50 px-3 py-1.5 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4 border-l border-slate-700 pl-4">
                <Link
                  href="/login"
                  className="text-sm text-gray-300 hover:text-white transition px-3 py-1.5"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-500 transition shadow-md"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
