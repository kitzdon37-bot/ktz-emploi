import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: paramètres du site
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const rows = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return withCors(NextResponse.json({ settings }), req);
  } catch (error) {
    console.error("[mobile/admin/settings GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// PUT: modifier un paramètre
export async function PUT(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { key, value } = await req.json();
    if (!key) return withCors(NextResponse.json({ error: "Clé manquante" }, { status: 400 }), req);

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value ?? "" },
      create: { key, value: value ?? "" },
    });

    return withCors(NextResponse.json({ success: true }), req);
  } catch (error) {
    console.error("[mobile/admin/settings PUT]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
