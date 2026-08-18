import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * GET /api/admin/credits/export - Descargar todos los créditos reales disponibles.
 */
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const credits = await prisma.credit.findMany({
      where: {
        isUsed: false,
        isTest: false,
      },
      select: {
        code: true,
        link: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const rows = [
      "code,link",
      ...credits.map((credit) =>
        [credit.code, credit.link].map(escapeCsvField).join(",")
      ),
    ];
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(`\uFEFF${rows.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="creditos-disponibles-${date}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("❌ [ADMIN] Error al exportar créditos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
