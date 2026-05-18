import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

async function sendWelcomeWhatsApp({
  phone,
  name,
  role,
  companyName,
}: {
  phone: string;
  name: string;
  role: "JOBSEEKER" | "EMPLOYER";
  companyName?: string | null;
}) {
  const instance = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  if (!instance || !token) return;

  const prenom = name.split(" ")[0];
  const baseUrl = process.env.NEXTAUTH_URL || "https://ktzemploi.com";

  const message =
    role === "EMPLOYER"
      ? `Bienvenue sur *KTZ Emploi*, ${prenom} ! 🎉\n\n` +
        `Votre compte recruteur${companyName ? ` pour *${companyName}*` : ""} a bien été créé.\n\n` +
        `✅ Vous pouvez maintenant :\n` +
        `• Publier vos offres d'emploi\n` +
        `• Accéder à la CVthèque\n` +
        `• Gérer vos candidatures\n\n` +
        `👉 Tableau de bord : ${baseUrl}/tableau-de-bord\n\n` +
        `_KTZ Emploi — La 1ère plateforme de recrutement de RCA_ 🇨🇫`
      : `Bienvenue sur *KTZ Emploi*, ${prenom} ! 🎉\n\n` +
        `Votre compte candidat a bien été créé.\n\n` +
        `✅ Vous pouvez maintenant :\n` +
        `• Parcourir les offres d'emploi\n` +
        `• Postuler en quelques clics\n` +
        `• Activer les alertes emploi\n\n` +
        `👉 Voir les offres : ${baseUrl}/emplois\n\n` +
        `_KTZ Emploi — La 1ère plateforme de recrutement de RCA_ 🇨🇫`;

  await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token, to: phone, body: message }).toString(),
  });
}

export async function POST(req: NextRequest) {
  // Rate limiting : 5 inscriptions par IP sur 1 heure
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return rateLimitResponse();
  }

  try {
    const { name, email, password, role, phone, whatsappOptIn, isDisabled, companyName, companySector, companyLocation, companyWebsite, companyDescription, jobTitle, location, contractTypes, phoneVerified } =
      await req.json();

    const userRole = role === "employer" ? "EMPLOYER" : "JOBSEEKER";

    // ── Inscription par WhatsApp (sans email) ─────────────────────────────────
    if (phoneVerified && phone && !email) {
      if (!name) return NextResponse.json({ error: "Le prénom est requis" }, { status: 400 });

      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json({ error: "Ce numéro est déjà utilisé" }, { status: 409 });
      }

      const user = await prisma.user.create({
        data: { name, phone, role: userRole },
      });

      if (userRole === "JOBSEEKER") {
        await prisma.jobSeekerProfile.create({
          data: {
            userId: user.id,
            title: jobTitle || null,
            location: location || null,
            skills: contractTypes || null,
            phone,
            whatsappOptIn: true,
            isDisabled: !!isDisabled,
          },
        });
      }

      if (userRole === "EMPLOYER" && companyName) {
        let slug = slugify(companyName);
        const existingSlug = await prisma.company.findUnique({ where: { slug } });
        if (existingSlug) slug = `${slug}-${Date.now()}`;
        await prisma.company.create({
          data: { userId: user.id, name: companyName, slug, sector: companySector || null, location: companyLocation || null, website: companyWebsite || null, description: companyDescription || null },
        });
      }

      await logActivity({
        userId: user.id,
        userEmail: phone,
        userName: user.name ?? undefined,
        type: "USER_REGISTERED",
        label: `Nouvelle inscription WhatsApp (${userRole === "EMPLOYER" ? "Recruteur" : "Candidat"})`,
        metadata: { role: userRole, phone },
      });

      // Message WhatsApp de bienvenue (non bloquant)
      sendWelcomeWhatsApp({ phone, name, role: userRole, companyName: companyName || null })
        .catch((err) => console.error("[Welcome WA]", err));

      return NextResponse.json({ success: true, userId: user.id });
    }

    // ── Inscription par email (flux classique) ────────────────────────────────
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
          phone: phone || null,
          whatsappOptIn: phone ? !!whatsappOptIn : false,
          isDisabled: !!isDisabled,
        },
      });
    }

    // Email de bienvenue (non bloquant)
    sendWelcomeEmail({
      name,
      email,
      role: userRole,
      companyName: companyName || null,
    }).catch((err) => console.error("[Welcome email]", err));

    await logActivity({
      userId: user.id,
      userEmail: user.email ?? undefined,
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
