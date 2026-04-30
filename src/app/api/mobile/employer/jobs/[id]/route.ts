import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS() {
  return handleOptions();
}

async function getEmployerJob(req: NextRequest, id: string) {
  const tokenUser = getMobileUser(req);
  if (!tokenUser || tokenUser.role !== "EMPLOYER") return null;

  const company = await prisma.company.findFirst({ where: { userId: tokenUser.id } });
  if (!company) return null;

  return prisma.job.findFirst({ where: { id, companyId: company.id } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await getEmployerJob(req, id);
    if (!job) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    return NextResponse.json({ job });
  } catch (error) {
    console.error("[mobile/employer/jobs/[id] GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await getEmployerJob(req, id);
    if (!existing) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const { title, type, category, location, remote, description, requirements, benefits, experienceLevel, salaryMin, salaryMax, salaryCurrency, deadline, published } = body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(category && { category }),
        ...(location !== undefined && { location }),
        ...(remote !== undefined && { remote }),
        ...(description && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(benefits !== undefined && { benefits }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(salaryMin !== undefined && { salaryMin: salaryMin ? parseInt(salaryMin) : null }),
        ...(salaryMax !== undefined && { salaryMax: salaryMax ? parseInt(salaryMax) : null }),
        ...(salaryCurrency && { salaryCurrency }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(published !== undefined && { published }),
      },
      include: {
        company: { select: { id: true, name: true, logo: true, verified: true, slug: true } },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("[mobile/employer/jobs/[id] PUT]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await getEmployerJob(req, id);
    if (!existing) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[mobile/employer/jobs/[id] DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
