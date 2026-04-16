import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;

  try {
    const { name, website, description, sector, size, location, phone, email } = await req.json();

    const company = await prisma.company.upsert({
      where: { userId },
      update: { name, website, description, sector, size, location, phone, email },
      create: {
        userId,
        name: name || "Mon entreprise",
        slug: `entreprise-${Date.now()}`,
        website,
        description,
        sector,
        size,
        location,
        phone,
        email,
      },
    });

    return NextResponse.json({ success: true, id: company.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
