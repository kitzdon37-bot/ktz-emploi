import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } });

  if (!subscriber) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  if (!subscriber.active) {
    return NextResponse.redirect(
      new URL("/newsletter/desabonnement?status=already", req.nextUrl.origin)
    );
  }

  await prisma.newsletterSubscriber.update({
    where: { token },
    data: { active: false },
  });

  return NextResponse.redirect(
    new URL("/newsletter/desabonnement?status=success", req.nextUrl.origin)
  );
}
