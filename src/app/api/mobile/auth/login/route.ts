import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signMobileToken } from "@/lib/jwt-mobile";
import { handleOptions } from "@/lib/cors";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  // Rate limiting : 10 tentatives par IP sur 5 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`mobile-login:${ip}`, 10, 5 * 60 * 1000)) {
    return rateLimitResponse();
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    if (user.suspended) {
      return NextResponse.json(
        { error: "Votre compte a été suspendu. Contactez l'administrateur." },
        { status: 403 }
      );
    }

    const token = signMobileToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("[mobile/auth/login]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
