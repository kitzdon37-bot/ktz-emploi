import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });

  const reviews = await prisma.companyReview.findMany({
    where: { companyId: company.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  // Mask user name for anonymous reviews
  const sanitizedReviews = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    pros: review.pros,
    cons: review.cons,
    anonymous: review.anonymous,
    createdAt: review.createdAt,
    user: review.anonymous ? null : { name: review.user.name },
  }));

  const total = reviews.length;
  const avgRating =
    total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;

  return NextResponse.json({ reviews: sanitizedReviews, avgRating, total });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "JOBSEEKER")
    return NextResponse.json({ error: "Réservé aux chercheurs d'emploi" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });

  const body = await req.json();
  const { rating, pros, cons, anonymous } = body;

  if (rating === undefined || rating === null) {
    return NextResponse.json({ error: "rating requis" }, { status: 400 });
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return NextResponse.json({ error: "rating doit être un entier entre 1 et 5" }, { status: 400 });
  }

  // Check for existing review (@@unique companyId + userId)
  const existing = await prisma.companyReview.findUnique({
    where: { companyId_userId: { companyId: company.id, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà évalué cette entreprise" }, { status: 409 });
  }

  const review = await prisma.companyReview.create({
    data: {
      companyId: company.id,
      userId,
      rating: parsedRating,
      pros: pros ?? null,
      cons: cons ?? null,
      anonymous: anonymous ?? true,
      status: "APPROVED",
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
