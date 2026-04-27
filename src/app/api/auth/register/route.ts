import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting : 5 inscriptions par IP sur 1 heure
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return rateLimitResponse();
  }

  try {
    const { name, email, password, role, companyName, companySector, companyLocation, companyWebsite, companyDescription, jobTitle, location, contractTypes } =
      await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userRole = role === "employer" ? "EMPLOYER" : "JOBSEEKER";

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: userRole },
    });

    // Create company profile if employer
    if (userRole === "EMPLOYER" && companyName) {
      let slug = slugify(companyName);
      const existingSlug = await prisma.company.findUnique({ where: { slug } });
      if (existingSlug) slug = `${slug}-${Date.now()}`;
      await prisma.company.create({
        data: {
          userId: user.id,
          name: companyName,
          slug,
          sector: companySector || null,
          location: companyLocation || null,
          website: companyWebsite || null,
          description: companyDescription || null,
        },
      });
    }

    // Create jobseeker profile with extra info
    if (userRole === "JOBSEEKER") {
      await prisma.jobSeekerProfile.create({
        data: {
          userId: user.id,
          title: jobTitle || null,
          location: location || null,
          skills: contractTypes || null,
        },
      });
    }

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userName: user.name ?? undefined,
      type: "USER_REGISTERED",
      label: `Nouvelle inscription (${userRole === "EMPLOYER" ? "Recruteur" : "Candidat"})`,
      metadata: { role: userRole, companyName: companyName || undefined },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
