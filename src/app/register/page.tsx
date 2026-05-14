'use client';

import { useState } from "react";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter permet de naviguer proprement en SPA

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await api.register({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
      });
      
      // Inscription réussie : on redirige vers la page de login
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input name="firstName" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input name="lastName" required className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input name="password" type="password" minLength={6} required className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
          S'inscrire
        </button>
      </form>
      
      <p className="mt-4 text-sm text-center">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
