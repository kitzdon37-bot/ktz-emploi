import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity";

// Génère un mot de passe lisible (sans caractères ambigus) : ex. "Ktz-7hq4-Pm9x"
function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) => Array.from(crypto.randomBytes(n), (b) => chars[b % chars.length]).join("");
  return `Ktz-${pick(4)}-${pick(4)}`;
}

// POST /api/admin/users/password
// Body :
//   { userId, mode: "set", password?: string }  → définit un nouveau mot de passe
//                                                  (généré automatiquement si absent)
//   { userId, mode: "link" }                     → envoie un lien de réinitialisation par email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const admin = session?.user as { role?: string; id?: string; email?: string; name?: string } | undefined;
  if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { userId, mode, password } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    mode?: "set" | "link";
    password?: string;
  };
  if (!userId || (mode !== "set" && mode !== "link")) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Un admin ne modifie pas le mot de passe d'un autre admin depuis ici
  if (user.role === "ADMIN" && user.id !== admin.id) {
    return NextResponse.json({ error: "Impossible de modifier le mot de passe d'un autre administrateur" }, { status: 403 });
  }

  // La connexion par mot de passe se fait avec l'email : sans email, un mot de passe ne sert à rien
  if (!user.email) {
    return NextResponse.json(
      { error: "Ce compte n'a pas d'email (inscription WhatsApp) : il se connecte uniquement par code WhatsApp." },
      { status: 400 }
    );
  }

  // ── Envoi d'un lien de réinitialisation ─────────────────────────────────────
  if (mode === "link") {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) }, // 1 h (durée annoncée dans l'email)
    });
    const resetUrl = `${process.env.NEXTAUTH_URL}/reinitialiser-mot-de-passe?token=${token}`;
    try {
      await sendResetEmail({ name: user.name ?? user.email, email: user.email, resetUrl });
    } catch (err) {
      console.error("[admin/password] Envoi email échoué", err);
      return NextResponse.json({ error: "L'email n'a pas pu être envoyé" }, { status: 502 });
    }
    await logActivity({
      userId: user.id, userEmail: user.email, userName: user.name ?? undefined,
      type: "PROFILE_UPDATED",
      label: "Lien de réinitialisation du mot de passe envoyé par l'admin",
      metadata: { by: admin.email },
    });
    return NextResponse.json({ success: true, mode: "link", email: user.email });
  }

  // ── Définition d'un nouveau mot de passe ────────────────────────────────────
  const newPassword = password?.trim() || generatePassword();
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 12),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  await logActivity({
    userId: user.id, userEmail: user.email, userName: user.name ?? undefined,
    type: "PROFILE_UPDATED",
    label: "Mot de passe modifié par l'admin",
    metadata: { by: admin.email },
  });

  // Le mot de passe n'est renvoyé qu'une seule fois, pour que l'admin puisse le transmettre
  return NextResponse.json({ success: true, mode: "set", email: user.email, password: newPassword });
}
