"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
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
  MessageCircle,
  Shield,
  KeyRound,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { TournamentType } from "@/types/tournament";
import { formatDateShort } from "@/lib/utils";
import {
  BAIRROS_OLINDA,
  generateRegistrationShareWhatsApp,
} from "@/lib/olinda";

type RegistrationStep = "FORM" | "VERIFY" | "SUCCESS";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Stepper state
  const [step, setStep] = useState<RegistrationStep>("FORM");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    partnerName: "",
    partnerNickname: "",
    neighborhood: "Rio Doce",
    communityOrProject: "",
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

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("Por favor, preencha o seu nome ou o nome da dupla.");
      }

      const cleanDigits = formData.phone.replace(/\D/g, "");
      if (cleanDigits.length < 10) {
        throw new Error("Por favor, informe um WhatsApp válido com DDD (ex: 81 99999-9999).");
      }

      const res = await fetch(`/api/torneios/${tournamentId}/inscricao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao iniciar inscrição.");
      }

      setParticipantId(data.participantId);
      if (data.whatsappUrl) {
        setWhatsappUrl(data.whatsappUrl);
      }
      setStep("VERIFY");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setIsVerifying(true);

    try {
      if (!participantId) {
        throw new Error("Sessão de inscrição inválida. Reinicie o processo.");
      }

      if (inputCode.replace(/\D/g, "").length !== 6) {
        throw new Error("Digite o código de 6 dígitos completo.");
      }

      const res = await fetch(`/api/torneios/${tournamentId}/inscricao/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          code: inputCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Código inválido ou expirado.");
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setStep("SUCCESS");
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/torneios/${tournamentId}/inscricao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao reenviar código.");

      if (data.whatsappUrl) {
        setWhatsappUrl(data.whatsappUrl);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTournament) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <span className="text-sm text-emerald-100/70 font-medium">Carregando formulário comunitário...</span>
        </div>
      </div>
    );
  }

  const isDuplas =
    tournament?.modality === "DUPLAS" ||
    tournament?.modality === "DOUBLES" ||
    tournament?.modality === "2x2";

  const hubUrl = typeof window !== "undefined" ? `${window.location.origin}/torneios/${tournamentId}` : "";
  const displayName = formData.nickname
    ? `${formData.name} (${formData.nickname})`
    : formData.name;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Top Back Link */}
      <Link
        href={`/torneios/${tournamentId}`}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-200/70 hover:text-amber-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar ao Torneio</span>
      </Link>

      {/* Main Card */}
      <div className="rounded-3xl border border-collegiate-border bg-collegiate-surface/95 p-6 sm:p-8 shadow-2xl backdrop-blur">
        {/* Tournament Summary Header */}
        <div className="border-b border-collegiate-border/80 pb-5 mb-6 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-collegiate-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 border border-collegiate-border">
            <span>Circuito Olinda/PE</span>
            <span>&bull;</span>
            <span>{isDuplas ? "Duplas 2x2" : "Individual 1x1"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {tournament?.title || "Inscrição no Campeonato"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-200/70 pt-1">
            {tournament?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>{tournament.location}</span>
              </span>
            )}
            {tournament?.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatDateShort(tournament.startDate)}</span>
              </span>
            )}
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === "FORM"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "bg-collegiate-dark text-slate-400 border border-collegiate-border"
              }`}
            >
              <span>1. Dados</span>
            </div>
            <div className="h-0.5 w-4 bg-collegiate-border" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === "VERIFY"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : step === "SUCCESS"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-collegiate-dark text-slate-400 border border-collegiate-border"
              }`}
            >
              <span>2. Confirmação WhatsApp</span>
            </div>
            <div className="h-0.5 w-4 bg-collegiate-border" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                step === "SUCCESS"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-collegiate-dark text-slate-400 border border-collegiate-border"
              }`}
            >
              <span>3. Vaga Confirmada</span>
            </div>
          </div>
        </div>

        {/* STEP 2: OTP Phone Verification */}
        {step === "VERIFY" && (
          <div className="py-2 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
                <KeyRound className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Validar Número de WhatsApp</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-md mx-auto">
                Para evitar inscrições falsas e garantir o sorteio das chaves, confirme o código de 6 dígitos enviado para seu número.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-collegiate-dark px-3.5 py-1 text-xs font-mono font-bold text-amber-300 border border-collegiate-border mt-1">
                <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                <span>{formData.phone}</span>
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="text-[10px] text-emerald-300 hover:text-white underline ml-1"
                >
                  (Corrigir)
                </button>
              </div>
            </div>

            {verifyError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{verifyError}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Novo código enviado com sucesso! Confira seu WhatsApp.</span>
              </div>
            )}

            {/* Direct WhatsApp Self-Message Banner */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    1. Enviar mensagem para seu próprio WhatsApp:
                  </h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    Clique no botão abaixo para abrir a mensagem com o código diretamente no seu WhatsApp:
                  </p>
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all border border-emerald-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Abrir meu WhatsApp e Receber o Código</span>
                </a>
              )}
            </div>

            {/* OTP Verification Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div className="space-y-2 text-center">
                <label
                  htmlFor="inputCode"
                  className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 block"
                >
                  2. Digite o código de 6 dígitos recebido:
                </label>
                <input
                  type="text"
                  id="inputCode"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="000000"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full max-w-[220px] mx-auto text-center font-mono text-2xl tracking-[0.4em] font-black rounded-xl border border-amber-500/60 bg-collegiate-dark px-4 py-3 text-amber-300 placeholder-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || inputCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-sm sm:text-base font-bold text-collegiate-dark shadow-xl shadow-amber-900/30 active:scale-95 disabled:opacity-40 transition-all border border-amber-400"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isVerifying ? "Validando Código..." : "Confirmar Código & Garantir Vaga"}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-emerald-200/60 pt-2 px-1">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="hover:text-white flex items-center gap-1"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar telefone</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                  className="hover:text-amber-400 flex items-center gap-1 text-amber-300 font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reenviar código</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Success Confirmation State */}
        {step === "SUCCESS" && (
          <div className="py-6 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
              <CheckCircle className="h-9 w-9" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-[11px] font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Telefone Verificado &bull; Inscrição Oficial</span>
              </div>
              <h2 className="text-2xl font-black text-white">Vaga Confirmada na Mesa!</h2>
              <p className="text-sm text-emerald-100/80">
                O atleta <strong>{displayName}</strong> está registrado para o campeonato em <strong>{formData.neighborhood}</strong>.
              </p>
            </div>

            {/* WhatsApp Share Button */}
            <div className="pt-2">
              <a
                href={generateRegistrationShareWhatsApp({
                  athleteName: displayName,
                  tournamentTitle: tournament?.title || "Campeonato de Futmesa",
                  neighborhood: formData.neighborhood,
                  hubUrl,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-emerald-900/40 transition-all border border-emerald-500"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Compartilhar Comprovante no WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/torneios/${tournamentId}`}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-collegiate-dark shadow-md hover:bg-amber-400 transition-all text-center"
              >
                Ver Chaveamento e Jogos
              </Link>
              <button
                onClick={() => {
                  setStep("FORM");
                  setInputCode("");
                  setFormData({
                    name: "",
                    nickname: "",
                    partnerName: "",
                    partnerNickname: "",
                    neighborhood: "Rio Doce",
                    communityOrProject: "",
                    phone: "",
                    email: "",
                  });
                }}
                className="text-xs text-emerald-200/60 hover:text-white py-1 transition-colors"
              >
                Inscrever outra dupla ou atleta
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "FORM" && (
          <form onSubmit={handleStartRegistration} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Atleta 1 / Nome do Jogador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isDuplas ? "Nome do Atleta 1" : "Nome do Atleta"} *</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="nickname"
                  className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
                >
                  Apelido / Vulgo
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder="Ex: Carlinhos"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Atleta 2 (Se Duplas) */}
            {isDuplas && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="partnerName"
                    className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    <span>Nome do Parceiro (Atleta 2)</span>
                  </label>
                  <input
                    type="text"
                    id="partnerName"
                    name="partnerName"
                    placeholder="Ex: Rafael Santos"
                    value={formData.partnerName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="partnerNickname"
                    className="text-xs font-bold uppercase tracking-wider text-emerald-100/90"
                  >
                    Apelido Parceiro
                  </label>
                  <input
                    type="text"
                    id="partnerNickname"
                    name="partnerNickname"
                    placeholder="Ex: Rafinha"
                    value={formData.partnerNickname}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-3 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Bairro de Olinda */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label
                  htmlFor="neighborhood"
                  className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Bairro em Olinda / Região *</span>
                </label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-3 py-2.5 text-base sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                >
                  {BAIRROS_OLINDA.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipe / Arena Comunitária */}
              <div className="space-y-1.5">
                <label
                  htmlFor="communityOrProject"
                  className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span>Arena / Projeto Social (Opcional)</span>
                </label>
                <input
                  type="text"
                  id="communityOrProject"
                  name="communityOrProject"
                  placeholder="Ex: Arena Rio Doce ou Futmesa da Vila"
                  value={formData.communityOrProject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* WhatsApp para Contato / Convocação */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/90 flex items-center gap-1.5"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp do Atleta (com DDD) *</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="(81) 90000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-emerald-200/60">
                🔒 Um código de 6 dígitos será enviado para confirmar este número antes de garantir a vaga.
              </p>
            </div>

            {/* Email (Opcional) */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-emerald-100/70 flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>Email de Contato (Opcional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seuemail@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-collegiate-border bg-collegiate-dark/90 px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 py-3.5 text-sm sm:text-base font-bold text-collegiate-dark shadow-xl shadow-amber-900/30 active:scale-95 disabled:opacity-50 transition-all mt-4 border border-amber-400"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? "Enviando Dados..." : "Avançar para Validação do WhatsApp"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


