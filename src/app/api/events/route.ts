import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const events = await prisma.recruitmentEvent.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });

  const body = await req.json();
  const { title, description, date, location, link } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "title et date requis" }, { status: 400 });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
  }

  const event = await prisma.recruitmentEvent.create({
    data: {
      title,
      description: description ?? null,
      date: parsedDate,
      location: location ?? null,
      link: link ?? null,
      published: true,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
