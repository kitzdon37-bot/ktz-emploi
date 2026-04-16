import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  try {
    const {
      title, type, category, location, remote, description,
      requirements, benefits, experienceLevel, salaryMin, salaryMax, deadline,
    } = await req.json();

    if (!title || !type || !category || !location || !description) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.job.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        slug,
        type,
        category,
        location,
        remote: !!remote,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        experienceLevel: experienceLevel || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        deadline: deadline ? new Date(deadline) : null,
        published: true,
      },
    });

    return NextResponse.json({ success: true, id: job.id, slug: job.slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
