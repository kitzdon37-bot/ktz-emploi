import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — liste de tous les utilisateurs (avec recherche optionnelle)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionRole = (session?.user as { role?: string })?.role;
  if (sessionRole !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const roleFilter = searchParams.get("role") ?? "";
  const limit = parseInt(searchParams.get("limit") ?? "200");

  const users = await prisma.user.findMany({
    where: {
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      suspended: true,
      createdAt: true,
      image: true,
      profile: { select: { phone: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Aplatit le téléphone pour faciliter l'usage côté client
  const flat = users.map(u => ({ ...u, phone: u.profile?.phone ?? null, profile: undefined }));

  return NextResponse.json({ users: flat });
}

// PATCH — changer le rôle ou suspendre un utilisateur
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as { role?: string; id?: string };
  if (currentUser?.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { userId } = body;
  if (!userId) return NextResponse.json({ error: "userId manquant" }, { status: 400 });

  // Handle suspended field
  if ("suspended" in body) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { suspended: body.suspended },
      select: { name: true, email: true, suspended: true },
    });
    return NextResponse.json({ success: true, user: updated });
  }

  // Handle role change
  const { role } = body;
  if (!role || !["ADMIN", "EMPLOYER", "JOBSEEKER"].includes(role)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // Empêcher l'admin de se rétrograder lui-même
  if (userId === currentUser.id && role !== "ADMIN") {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
