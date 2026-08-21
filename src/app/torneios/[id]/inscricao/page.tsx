"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { TournamentType } from "@/types/tournament";
import { formatDateShort } from "@/lib/utils";

export default function InscricaoPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;
  const router = useRouter();

  const [tournament, setTournament] = useState<TournamentType | null>(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    partnerName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function loadTournament() {
      try {
        const res = await fetch(`/api/torneios/${tournamentId}`);
        if (!res.ok) throw new Error("Torneio não encontrado.");
        const data = await res.json();
        setTournament(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingTournament(false);
      }
    }
    loadTournament();
  }, [tournamentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Por favor, preencha o seu nome ou o nome da dupla.");
      }

      const res = await fetch(`/api/torneios/${tournamentId}/inscricao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao registrar inscrição.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTournament) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="text-sm text-slate-400 font-medium">Carregando informações do torneio...</span>
        </div>
      </div>
    );
  }

  const isDuplas = tournament?.modality === "DUPLAS";

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      {/* Top Back Link */}
      <Link
        href={`/torneios/${tournamentId}`}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Torneio</span>
      </Link>

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur">
        {/* Tournament Summary Header */}
        <div className="border-b border-slate-800 pb-5 mb-6 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
            {isDuplas ? "Inscrição de Dupla (2x2)" : "Inscrição Individual (1x1)"}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {tournament?.title || "Inscrição no Torneio"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 pt-1">
            {tournament?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>{tournament.location}</span>
              </span>
            )}
            {tournament?.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>{formatDateShort(tournament.startDate)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Success Confirmation State */}
        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Inscrição Confirmada!</h2>
              <p className="text-sm text-slate-300">
                Parabéns! Sua inscrição no torneio foi registrada com sucesso.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href={`/torneios/${tournamentId}`}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all text-center"
              >
                Ver Hub do Torneio
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({ name: "", partnerName: "", phone: "", email: "" });
                }}
                className="text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
              >
                Inscrever outra dupla ou atleta
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Atleta 1 / Nome do Jogador */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isDuplas ? "Nome do Jogador 1 / Nome da Dupla" : "Nome do Atleta"} *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: Carlos Silva"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Atleta 2 (Se Duplas) */}
            {isDuplas && (
              <div className="space-y-1.5">
                <label
                  htmlFor="partnerName"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                >
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Nome do Parceiro (Jogador 2)</span>
                </label>
                <input
                  type="text"
                  id="partnerName"
                  name="partnerName"
                  placeholder="Ex: Rafael Santos"
                  value={formData.partnerName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Telefone / WhatsApp */}
            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp para Contato / Avisos</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(00) 90000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Email (Opcional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>Email Universitário / Pessoal (Opcional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seuemail@universidade.edu.br"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all mt-4"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? "Registrando Inscrição..." : "Confirmar Inscrição Gratuita"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
