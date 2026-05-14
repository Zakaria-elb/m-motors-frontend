'use client';

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth(); // On récupère la fonction login du contexte
  const [error, setError] = useState(""); // Message d'erreur éventuel

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Empêche le navigateur de recharger la page (comportement par défaut des formulaires)
    
    const formData = new FormData(e.currentTarget); // Récupère les valeurs des inputs
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password); // Appel à l'API via notre AuthProvider
      window.location.href = "/espace-client"; // Redirection vers l'espace client
    } catch {
      setError("Email ou mot de passe invalide");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800"
        >
          Se connecter
        </button>
      </form>
      
      <p className="mt-4 text-sm text-center">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-blue-600 underline hover:text-blue-800">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
