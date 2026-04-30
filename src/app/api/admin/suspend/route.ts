import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { type, id, suspended } = await req.json();

  if (!type || !id || typeof suspended !== "boolean") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  if (type === "user") {
    await prisma.user.update({ where: { id }, data: { suspended } });
  } else if (type === "company") {
    await prisma.company.update({ where: { id }, data: { suspended } });
  } else {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
