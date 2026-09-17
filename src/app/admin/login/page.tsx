"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Submissão do formulário de login do administrador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no login.");

      // Redireciona com recarregamento completo para atualizar a sessão em todos os componentes
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
      >
        <h1 className="text-xl font-bold text-white text-center">
          Área do Administrador
        </h1>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 font-semibold mb-1 block">
            Usuário
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold mb-1 block">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold p-3 rounded-xl text-sm transition-colors"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
