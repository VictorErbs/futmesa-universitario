import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// Garante que a rota seja sempre executada dinamicamente sem cache
export const dynamic = "force-dynamic";

// Rota GET para verificar o status de autenticação do administrador
export async function GET() {
  const admin = await isAdmin();
  return NextResponse.json(
    { isAdmin: admin },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}