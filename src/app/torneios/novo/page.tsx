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
  Store,
  FileText,
} from "lucide-react";
import { BAIRROS_OLINDA, POLOS_POPULARES_OLINDA } from "@/lib/olinda";

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
    location: "Mesa Universitária de MesaMatch - Campus Central",
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

  const handleLocationPreset = (preset: string) => {
    setFormData((prev) => ({ ...prev, location: preset }));
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
        throw new Error(data.error || "Falha ao criar campeonato");
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200/70 hover:text-amber-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para Campeonatos</span>
      </Link>

      {/* Main Form Card */}
      <div className="rounded-3xl border border-collegiate-border bg-collegiate-surface/95 p-6 sm:p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3 border-b border-collegiate-border/80 pb-5 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Criar Novo Torneio de MesaMatch
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/70">
              Configure as chaves, polo comunitário de Olinda/PE e apoiadores do evento
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
              className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
            >
              Nome do Campeonato / Edição <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ex: 1º Torneio Universitário de MesaMatch 2026"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Grid: Bairro de Olinda & Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="community"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Bairro Sede (Olinda/PE)</span>
              </label>
              <select
                id="community"
                name="community"
                value={formData.community}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {BAIRROS_OLINDA.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Mesa / Praça / Arena</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Ex: Orla de Rio Doce ou Praça do Fortim"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick presets for Olinda locations */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/60">
              Sugestões rápidas de locais em Olinda:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POLOS_POPULARES_OLINDA.slice(0, 5).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleLocationPreset(preset)}
                  className="rounded-lg border border-collegiate-border bg-collegiate-dark/70 px-2.5 py-1 text-xs text-emerald-100/80 hover:bg-collegiate-dark hover:border-amber-400 hover:text-amber-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Grid: Modalidade & Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modalidade */}
            <div className="space-y-2">
              <label
                htmlFor="modality"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
              >
                <Users className="h-4 w-4 text-amber-400" />
                <span>Modalidade</span>
              </label>
              <select
                id="modality"
                name="modality"
                value={formData.modality}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="DUPLAS">2x2 - Duplas (Padrão das Praças)</option>
                <option value="INDIVIDUAL">1x1 - Individual (X1 de Mesa)</option>
              </select>
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <label
                htmlFor="format"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
              >
                <Swords className="h-4 w-4 text-amber-400" />
                <span>Formato de Disputa</span>
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
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
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
              >
                Pontos por Set
              </label>
              <select
                id="pointsPerSet"
                name="pointsPerSet"
                value={formData.pointsPerSet}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                <option value={15}>15 Pontos (Diferença de 2)</option>
                <option value={18}>18 Pontos (Padrão MesaMatch)</option>
                <option value={21}>21 Pontos (Oficial Teqball / MesaMatch)</option>
              </select>
            </div>

            {/* Duração dos Sets */}
            <div className="space-y-2">
              <label
                htmlFor="maxSets"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
              >
                Duração da Partida
              </label>
              <select
                id="maxSets"
                name="maxSets"
                value={formData.maxSets}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                <option value={1}>Set Único (Recomendado para torneios de 1 dia)</option>
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
                placeholder="Ex: Mesa de MesaMatch - Ginásio Universitário"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

          {/* Descrição / Avisos Comunitários */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
            >
              Descrição & Premiação
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Informações sobre premiação, troféus comunitários, regras de convivência..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Data e Horário */}
          <div className="space-y-2">
            <label
              htmlFor="startDate"
              className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
            >
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Data & Horário de Início</span>
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-collegiate-border/80 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="rounded-xl border border-collegiate-border px-5 py-3 text-sm font-semibold text-emerald-100/70 hover:bg-collegiate-dark transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-7 py-3 text-sm font-bold text-collegiate-dark shadow-xl shadow-amber-900/30 active:scale-95 disabled:opacity-50 transition-all border border-amber-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? "Criando Campeonato..." : "Criar Campeonato"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
