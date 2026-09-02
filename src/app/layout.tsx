import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#081a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MesaMatch | Gestão de Torneios & Placar ao Vivo",
  description:
    "Plataforma de gestão de campeonatos de MesaMatch para projetos de extensão universitária e comunidade. Chaveamento automático, grupos e placar digital.",
  keywords: [
    "MesaMatch",
    "torneio universitário",
    "extensão universitária",
    "placar ao vivo",
    "chaveamento mata-mata",
    "teqball",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
