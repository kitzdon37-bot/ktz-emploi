import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions, withCors } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return withCors(
      NextResponse.json({ users }),
      req
    );
  } catch (error) {
    console.error("[mobile/admin/users GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
