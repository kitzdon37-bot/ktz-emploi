import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste toutes les offres (admin)
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const status = searchParams.get("status"); // "published" | "unpublished" | null
    const skip = (page - 1) * limit;

    const where = status === "published" ? { published: true } : status === "unpublished" ? { published: false } : {};

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          company: { select: { name: true, logo: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return withCors(NextResponse.json({ jobs, total, page, limit }), req);
  } catch (error) {
    console.error("[mobile/admin/jobs GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// PUT: publier/dépublier une offre
export async function PUT(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id, published } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    const job = await prisma.job.update({
      where: { id },
      data: { published },
    });

    return withCors(NextResponse.json({ job }), req);
  } catch (error) {
    console.error("[mobile/admin/jobs PUT]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// DELETE: supprimer une offre
export async function DELETE(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    await prisma.job.delete({ where: { id } });
    return withCors(NextResponse.json({ success: true }), req);
  } catch (error) {
    console.error("[mobile/admin/jobs DELETE]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
