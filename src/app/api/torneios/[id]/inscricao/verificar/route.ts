import { NextResponse } from "next/server";

// Rota desativada - Inscrições agora são diretas sem verificação por código OTP
export async function POST() {
  return NextResponse.json(
    { message: "Verificação por código desativada. As inscrições são diretas." },
    { status: 200 }
  );
}
