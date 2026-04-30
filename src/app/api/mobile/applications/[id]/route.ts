import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return handleOptions();
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findFirst({ where: { userId: tokenUser.id } });
    if (!company) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application || application.job.companyId !== company.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { status } = await req.json();
    const validStatuses = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("[mobile/applications/[id] PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
