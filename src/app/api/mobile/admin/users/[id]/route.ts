import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions, withCors } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = getMobileUser(req);

    if (!tokenUser) {
      return withCors(
        NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
        req
      );
    }

    if (tokenUser.role !== "ADMIN") {
      return withCors(
        NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }),
        req
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        createdAt: true,
        profile: {
          select: {
            title: true,
            bio: true,
            skills: true,
            location: true,
            phone: true,
            experience: true,
            education: true,
          },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    });

    if (!user) {
      return withCors(
        NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 }),
        req
      );
    }

    const applications = await prisma.application.findMany({
      where: { userId: id },
      select: {
        id: true,
        jobId: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            title: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: id },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
        job: {
          select: {
            title: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return withCors(
      NextResponse.json({ user, applications, savedJobs }),
      req
    );
  } catch (error) {
    console.error("[mobile/admin/users/[id] GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
