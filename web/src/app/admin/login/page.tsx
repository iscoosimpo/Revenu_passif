"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Tentative de connexion pour:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Résultat Supabase:", { data, error });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      console.log("Connexion réussie, redirection vers le Dashboard...");
      window.location.href = "/admin";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2rem] shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Administration</h1>
          <p className="text-[var(--muted)] mt-2">Connectez-vous pour gérer votre site</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
