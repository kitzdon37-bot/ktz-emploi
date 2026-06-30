import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste toutes les entreprises (admin)
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { jobs: { where: { published: true } } } },
          user: { select: { email: true } },
        },
      }),
      prisma.company.count(),
    ]);

    return withCors(NextResponse.json({ companies, total, page, limit }), req);
  } catch (error) {
    console.error("[mobile/admin/companies GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// PUT: vérifier/suspendre une entreprise
export async function PUT(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id, verified, suspended, superRecruiter } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(verified !== undefined && { verified }),
        ...(suspended !== undefined && { suspended }),
        ...(superRecruiter !== undefined && { superRecruiter }),
      },
    });

    return withCors(NextResponse.json({ company }), req);
  } catch (error) {
    console.error("[mobile/admin/companies PUT]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
