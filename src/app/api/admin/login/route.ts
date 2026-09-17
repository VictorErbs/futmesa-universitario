import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

// Processa a tentativa de login de administrador e define o cookie de sessão
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    if (admin.password !== password && admin.password !== hashedPassword) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Login realizado!" });
    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}