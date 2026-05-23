import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "M-Motors - Achat & Location de véhicules",
  description: "Trouvez votre prochain véhicule d'occasion chez M-Motors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="fr">
        <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
