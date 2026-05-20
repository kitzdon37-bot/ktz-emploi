import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Appelé après un login Google pour assigner le rôle choisi avant la redirection OAuth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role"); // "employer" | "jobseeker"

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.redirect(new URL("/connexion", req.url));

  // Si l'utilisateur existe déjà avec un rôle défini (pas une nouvelle inscription), on redirige directement
  const isNewUser = !user.createdAt || (Date.now() - user.createdAt.getTime()) < 30_000;

  if (role === "employer" && (isNewUser || user.role === "JOBSEEKER")) {
    // Mettre à jour en EMPLOYER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "EMPLOYER" },
    });

    // Supprimer le profil candidat s'il existe
    await prisma.jobSeekerProfile.deleteMany({ where: { userId: user.id } });

    // Créer le profil recruteur si absent
    const company = await prisma.company.findFirst({ where: { userId: user.id } });
    if (!company) {
      const name = user.name ?? "Mon entreprise";
      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const exists = await prisma.company.findUnique({ where: { slug } });
      if (exists) slug = `${slug}-${user.id.slice(0, 6)}`;
      await prisma.company.create({
        data: { userId: user.id, name, slug },
      });
    }

    return NextResponse.redirect(new URL("/tableau-de-bord/entreprise", req.url));
  }

  // Candidat ou rôle déjà défini → dashboard standard
  return NextResponse.redirect(new URL("/tableau-de-bord", req.url));
}
