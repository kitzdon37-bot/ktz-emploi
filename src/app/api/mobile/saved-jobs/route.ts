import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  const mobileUser = getMobileUser(req);
  if (!mobileUser) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: mobileUser.id },
      include: {
        job: {
          include: {
            company: { select: { name: true, logo: true, verified: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedJobs });
  } catch (error) {
    console.error("[mobile/saved-jobs GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
