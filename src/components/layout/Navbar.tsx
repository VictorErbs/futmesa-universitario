"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, PlusCircle, BookOpen, Menu, X, ShieldCheck } from "lucide-react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-collegiate-border/90 bg-collegiate-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-collegiate-dark font-black shadow-md shadow-amber-500/20 border border-amber-400 group-hover:scale-105 transition-transform">
            <Trophy className="h-5 w-5 fill-collegiate-dark" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
              MesaMatch <span className="text-amber-400">UNIVERSITÁRIO</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/70">
              Liga Acadêmica &bull; Extensão
            </span>
          </div>
        </Link>

        {/* Extension Badge & Main Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Projeto de Extensão Universitária</span>
          </div>

          <nav className="flex items-center gap-5 text-sm font-semibold text-slate-200">
            <Link
              href="/"
              className="hover:text-amber-400 transition-colors"
            >
              Torneios
            </Link>
            <Link
              href="/torneios/novo"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-emerald-700/30 hover:bg-emerald-500 active:scale-95 transition-all border border-emerald-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Criar Torneio</span>
            </Link>
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/torneios/novo"
            className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500"
            title="Criar Torneio"
          >
            <PlusCircle className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 px-4 py-4 space-y-3">
          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Projeto de Extensão Comunitário</span>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-emerald-400"
            >
              🏆 Todos os Torneios
            </Link>
            <Link
              href="/torneios/novo"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white text-center shadow hover:bg-emerald-500"
            >
              + Criar Novo Torneio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
