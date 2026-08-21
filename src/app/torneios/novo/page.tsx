"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Swords,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Flame,
} from "lucide-react";

export default function NovoTorneioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    modality: "DUPLAS", // INDIVIDUAL, DUPLAS
    format: "MATA_MATA", // MATA_MATA, GRUPOS_E_MATA_MATA
    pointsPerSet: 18, // 15, 18, 21
    maxSets: 3, // 1, 3
    location: "Mesa Universitária de Futmesa - Campus Central",
    startDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "pointsPerSet" || name === "maxSets" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error("O nome do torneio é obrigatório.");
      }

      const res = await fetch("/api/torneios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao criar torneio");
      }

      const created = await res.json();
      router.push(`/torneios/${created.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para Torneios</span>
      </Link>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Criar Novo Torneio de Futmesa
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure as regras esportivas, modalidade e local do campeonato
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título do Torneio */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Nome do Torneio <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ex: 1º Torneio Universitário de Futmesa 2026"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Descrição & Informações da Comunidade
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Informações sobre premiação, horários, regras especiais ou apoio institucional..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Grid: Modalidade & Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modalidade */}
            <div className="space-y-2">
              <label
                htmlFor="modality"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <Users className="h-4 w-4 text-emerald-400" />
                <span>Modalidade</span>
              </label>
              <select
                id="modality"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="DUPLAS">2x2 - Duplas (Recomendado)</option>
                <option value="INDIVIDUAL">1x1 - Individual (X1)</option>
              </select>
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <label
                htmlFor="format"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <Swords className="h-4 w-4 text-emerald-400" />
                <span>Formato de Disputa</span>
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="MATA_MATA">Mata-Mata (Eliminatória Direta)</option>
                <option value="GRUPOS_E_MATA_MATA">
                  Fase de Grupos + Mata-Mata Final
                </option>
              </select>
            </div>
          </div>

          {/* Grid: Regras de Pontuação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pontos por Set */}
            <div className="space-y-2">
              <label
                htmlFor="pointsPerSet"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Pontos por Set
              </label>
              <select
                id="pointsPerSet"
                name="pointsPerSet"
                value={formData.pointsPerSet}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={15}>15 Pontos (Diferença de 2)</option>
                <option value={18}>18 Pontos (Padrão Futmesa)</option>
                <option value={21}>21 Pontos (Oficial Teqball / Futmesa)</option>
              </select>
            </div>

            {/* Duração dos Sets */}
            <div className="space-y-2">
              <label
                htmlFor="maxSets"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Duração da Partida
              </label>
              <select
                id="maxSets"
                name="maxSets"
                value={formData.maxSets}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={1}>Melhor de 1 Set (Set Único)</option>
                <option value={3}>Melhor de 3 Sets (Vence quem fizer 2)</option>
              </select>
            </div>
          </div>

          {/* Grid: Local e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Local do Evento</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Ex: Mesa de Futmesa - Ginásio Universitário"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Data / Horário */}
            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Data & Horário Previstos</span>
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? "Criando Torneio..." : "Criar Torneio"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
