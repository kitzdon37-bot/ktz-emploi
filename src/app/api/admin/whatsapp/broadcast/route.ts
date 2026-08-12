import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { message, targetRole } = await req.json();
  // targetRole : "ALL" | "JOBSEEKER" | "EMPLOYER"

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    whatsappOptIn: true,
    phone: { not: null },
    user: { suspended: false },
  };

  if (targetRole === "JOBSEEKER") where.user = { ...(where.user as object), role: "JOBSEEKER", suspended: false };
  if (targetRole === "EMPLOYER") where.user = { ...(where.user as object), role: "EMPLOYER", suspended: false };

  const profiles = await prisma.jobSeekerProfile.findMany({
    where,
    select: { phone: true },
  });

  // Pour les recruteurs (pas de jobSeekerProfile), on cherche dans User directement
  const employerUsers = targetRole !== "JOBSEEKER"
    ? await prisma.user.findMany({
        where: {
          role: "EMPLOYER",
          suspended: false,
          phone: { not: null },
        },
        select: { phone: true },
      })
    : [];

  const phones = [
    ...profiles.map(p => p.phone!),
    ...employerUsers.map(u => u.phone!),
  ].filter(Boolean);

  let sent = 0;
  let failed = 0;

  for (const phone of phones) {
    const ok = await sendWhatsApp(phone, message.trim());
    if (ok) sent++; else failed++;
  }

  return NextResponse.json({ success: true, sent, failed, total: phones.length });
}
