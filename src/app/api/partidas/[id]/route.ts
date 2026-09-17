import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir partidas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.match.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Partida excluída com sucesso." });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao excluir partida: " + error.message },
      { status: 500 }
    );
  }
}