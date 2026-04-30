import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        jobs: {
          where: { published: true },
          include: {
            _count: { select: { applications: true } },
          },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        },
        _count: { select: { jobs: { where: { published: true } } } },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("[mobile/companies/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
