import { cookies } from "next/headers";
import prisma from "@/lib/db";

// Verifica se o usuário atual possui sessão válida de administrador
export async function isAdmin(): Promise<boolean> {
  try {
    const cookiestore = await cookies();
    const sessionid = cookiestore.get("admin_session")?.value;

    if (!sessionid) return false;

    const admin = await prisma.admin.findUnique({
      where: { id: sessionid },
    });

    return !!admin;
  } catch {
    return false;
  }
}

// Exportação com alias para compatibilidade
export const isadmin = isAdmin;