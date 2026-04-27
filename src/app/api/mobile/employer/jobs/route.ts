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

    const company = await prisma.company.findFirst({ where: { userId: tokenUser.id } });
    if (!company) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, pages: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { companyId: company.id },
        include: {
          _count: { select: { applications: true } },
          company: { select: { id: true, name: true, logo: true, verified: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.job.count({ where: { companyId: company.id } }),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[mobile/employer/jobs GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id }, select: { suspended: true } });
    if (dbUser?.suspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

    const company = await prisma.company.findFirst({ where: { userId: tokenUser.id } });
    if (!company) {
      return NextResponse.json({ error: "Vous devez d'abord créer votre profil entreprise" }, { status: 400 });
    }
    if (company.suspended) return NextResponse.json({ error: "Entreprise suspendue" }, { status: 403 });

    const body = await req.json();
    const { title, type, category, location, remote, description, requirements, benefits, experienceLevel, salaryMin, salaryMax, salaryCurrency, deadline } = body;

    if (!title || !type || !category || !description) {
      return NextResponse.json({ error: "Titre, type, secteur et description obligatoires" }, { status: 400 });
    }

    const slugBase = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        type,
        category,
        location: location || "Bangui",
        remote: remote || false,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        experienceLevel: experienceLevel || null,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryCurrency: salaryCurrency || "XAF",
        deadline: deadline ? new Date(deadline) : null,
        published: false,
        featured: false,
        companyId: company.id,
      },
      include: {
        company: { select: { id: true, name: true, logo: true, verified: true, slug: true } },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("[mobile/employer/jobs POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
