import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste des avis d'une entreprise
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const reviews = await prisma.companyReview.findMany({
      where: { companyId: id, status: "APPROVED" },
      select: {
        id: true,
        rating: true,
        pros: true,
        cons: true,
        anonymous: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitized = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      pros: r.pros,
      cons: r.cons,
      createdAt: r.createdAt.toISOString(),
      authorName: r.anonymous ? "Employé anonyme" : (r.user?.name ?? "Anonyme"),
    }));

    const avg =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    return withCors(NextResponse.json({ reviews: sanitized, averageRating: avg, total: reviews.length }), req);
  } catch (error) {
    console.error("[mobile/companies/[id]/reviews GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// POST: soumettre un avis
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser) {
      return withCors(NextResponse.json({ error: "Non authentifié" }, { status: 401 }), req);
    }

    const { id } = await params;
    const { rating, pros, cons, anonymous = true } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return withCors(NextResponse.json({ error: "Note invalide (1-5)" }, { status: 400 }), req);
    }

    // Vérifier si l'entreprise existe
    const company = await prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!company) {
      return withCors(NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 }), req);
    }

    // Un seul avis par utilisateur par entreprise
    const existing = await prisma.companyReview.findFirst({
      where: { companyId: id, userId: tokenUser.userId },
    });
    if (existing) {
      return withCors(NextResponse.json({ error: "Vous avez déjà laissé un avis pour cette entreprise" }, { status: 409 }), req);
    }

    const review = await prisma.companyReview.create({
      data: {
        companyId: id,
        userId: tokenUser.userId,
        rating: Math.round(rating),
        pros: pros?.trim() || null,
        cons: cons?.trim() || null,
        anonymous,
        status: "APPROVED",
      },
    });

    return withCors(NextResponse.json({ review, message: "Avis publié avec succès" }), req);
  } catch (error) {
    console.error("[mobile/companies/[id]/reviews POST]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
