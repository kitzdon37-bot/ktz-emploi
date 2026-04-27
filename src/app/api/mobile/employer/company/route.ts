import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findFirst({
      where: { userId: tokenUser.id },
      include: { _count: { select: { jobs: { where: { published: true } } } } },
    });

    return NextResponse.json({ company: company ?? null });
  } catch (error) {
    console.error("[mobile/employer/company GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id }, select: { suspended: true } });
    if (dbUser?.suspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

    const body = await req.json();
    const { name, website, description, sector, size, location, phone, email } = body;

    if (!name) {
      return NextResponse.json({ error: "Nom de l'entreprise obligatoire" }, { status: 400 });
    }

    const slugBase = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.company.findFirst({ where: { userId: tokenUser.id } });

    const company = await prisma.company.upsert({
      where: { id: existing?.id ?? "none" },
      create: {
        name,
        slug: `${slugBase}-${Date.now()}`,
        website: website || null,
        description: description || null,
        sector: sector || null,
        size: size || null,
        location: location || null,
        phone: phone || null,
        email: email || null,
        userId: tokenUser.id,
      },
      update: {
        name,
        website: website || null,
        description: description || null,
        sector: sector || null,
        size: size || null,
        location: location || null,
        phone: phone || null,
        email: email || null,
      },
      include: { _count: { select: { jobs: { where: { published: true } } } } },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("[mobile/employer/company PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
