import { NextResponse } from "next/server";

// Remove a sessão do administrador limpando o cookie
export async function POST() {
  const response = NextResponse.json({ success: true, message: "Desconectado com sucesso." });
  response.cookies.delete("admin_session");
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}