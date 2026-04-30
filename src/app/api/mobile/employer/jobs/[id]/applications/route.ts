import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findFirst({ where: { userId: tokenUser.id } });
    if (!company) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });

    const job = await prisma.job.findFirst({ where: { id, companyId: company.id } });
    if (!job) return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });

    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("[mobile/employer/jobs/[id]/applications]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
