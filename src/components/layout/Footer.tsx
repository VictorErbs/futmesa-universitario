import React from "react";
import Link from "next/link";
import { Trophy, Heart, Github, GraduationCap, Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-collegiate-border/80 bg-collegiate-dark text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-collegiate-dark font-black">
                <Trophy className="h-5 w-5 fill-collegiate-dark" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                FUTMESA <span className="text-amber-400">UNIVERSITÁRIO</span>
              </span>
            </div>
            <p className="text-sm text-emerald-100/70 max-w-md leading-relaxed">
              Plataforma de extensão universitária criada para fomentar a integração, o espírito atlético e o esporte em campeonatos de futmesa.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-collegiate-surface border border-collegiate-border px-3 py-1.5 text-xs text-amber-300">
              <GraduationCap className="h-4 w-4 text-amber-400" />
              <span>Iniciativa de Extensão Universitária • Uso Gratuito</span>
            </div>
          </div>

          {/* Col 2: Torneios */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 text-slate-300 transition-colors">
                  Torneios em Andamento
                </Link>
              </li>
              <li>
                <Link href="/torneios/novo" className="hover:text-amber-400 text-slate-300 transition-colors">
                  Criar Novo Torneio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Regras & Esporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Regras do Futmesa
            </h4>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Máximo de 3 toques por equipe, proibido tocar na mesa com as mãos ou corpo, saque alternado e sets em 15, 18 ou 21 pontos com vantagem de 2 pontos.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-collegiate-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Futmesa Universitário &bull; Desenvolvido para a comunidade.
          </p>
          <div className="flex items-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>para o esporte universitário</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
