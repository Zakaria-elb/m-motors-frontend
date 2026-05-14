// ============================================
// Ce fichier est le SQUELETTE de toute l'application.
// Il s'affiche AUTOUR de chaque page.
// ============================================

import type { Metadata } from "next";   // Pour définir le titre de l'onglet navigateur
import { Inter } from "next/font/google"; // Police d'écriture
import "./globals.css";                  // Les styles Tailwind CSS de base
import { AuthProvider } from "@/providers/auth-provider"; // Notre "mémoire" utilisateur
import { Navbar } from "@/components/navbar";             // Notre barre de navigation

// On charge la police Inter (Google Fonts optimisée par Next.js)
const inter = Inter({ subsets: ["latin"] });

// Le titre qui apparaît dans l'onglet du navigateur
export const metadata: Metadata = {
  title: "M-Motors - Achat & Location de véhicules",
  description: "Trouvez votre prochain véhicule d'occasion chez M-Motors",
};

export default function RootLayout({
  children, // "children" = la page spécifique affichée (accueil, login, etc.)
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // AuthProvider englobe TOUT pour que n'importe quelle page sache si tu es connecté
    <AuthProvider>
      <html lang="fr">
        <body className={`${inter.className} bg-gray-50 min-h-screen`}>
          {/* La Navbar est affichée sur TOUTES les pages */}
          <Navbar />
          
          {/* Ici s'insère la page spécifique (accueil, login, etc.) */}
          <main>{children}</main>
        </body>
      </html>
    </AuthProvider>
  );
}
