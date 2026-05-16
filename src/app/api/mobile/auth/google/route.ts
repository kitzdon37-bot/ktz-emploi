import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/jwt-mobile";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken manquant" }, { status: 400 });
    }

    // Récupérer le profil Google avec l'access token
    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!googleRes.ok) {
      return NextResponse.json({ error: "Token Google invalide" }, { status: 401 });
    }

    const googleUser = await googleRes.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    if (!googleUser.email) {
      return NextResponse.json({ error: "Email introuvable dans le compte Google" }, { status: 400 });
    }

    // Trouver ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user?.suspended) {
      return NextResponse.json({ error: "Votre compte a été suspendu." }, { status: 403 });
    }

    if (!user) {
      // Nouveau compte via Google
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          role: "JOBSEEKER",
          emailVerified: new Date(),
        },
      });
      // Créer le profil candidat
      await prisma.jobSeekerProfile.create({
        data: { userId: user.id },
      });
    } else if (!user.image && googleUser.picture) {
      // Mettre à jour la photo si manquante
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: googleUser.picture },
      });
    }

    const token = signMobileToken({
      id: user.id,
      email: user.email ?? "",
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
    console.error("[mobile/auth/google]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
