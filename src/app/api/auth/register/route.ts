import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, companyName, jobTitle, location, contractTypes } =
      await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
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
        data: { userId: user.id, name: companyName, slug },
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

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
