import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendJobNotifications } from "@/lib/notifications";

// GET — offres en attente (?pending=true) OU toutes les offres (?all=true)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const all = req.nextUrl.searchParams.get("all") === "true";

  const jobs = await prisma.job.findMany({
    where: all ? undefined : { published: false },
    include: {
      company: { select: { name: true, logo: true, sector: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jobs });
}

// PATCH — approuver/rejeter OU modifier les champs d'une offre
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { jobId } = body;
  if (!jobId) return NextResponse.json({ error: "jobId manquant" }, { status: 400 });

  // Mode approbation/rejet
  if (body.action) {
    const { action } = body;
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }
    if (action === "approve") {
      const job = await prisma.job.update({
        where: { id: jobId },
        data: { published: true },
        include: { company: { select: { name: true } } },
      });

      // Notifications automatiques si le recruteur l'a demandé
      if (job.notifyOnApproval) {
        // Fire-and-forget : on n'attend pas la fin pour répondre
        sendJobNotifications(job).catch(err =>
          console.error("[Notifications] Erreur envoi:", err)
        );
      }

      return NextResponse.json({ success: true, message: "Offre publiée" });
    }
    await prisma.job.delete({ where: { id: jobId } });
    return NextResponse.json({ success: true, message: "Offre rejetée et supprimée" });
  }

  // Mode mise à jour des champs
  const { updates } = body as {
    updates: {
      title?: string;
      type?: string;
      category?: string;
      location?: string;
      remote?: boolean;
      description?: string;
      requirements?: string;
      benefits?: string;
      salaryMin?: number | null;
      salaryMax?: number | null;
      experienceLevel?: string;
      deadline?: string | null;
      featured?: boolean;
      published?: boolean;
    };
  };

  if (!updates) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.remote !== undefined && { remote: updates.remote }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.requirements !== undefined && { requirements: updates.requirements || null }),
      ...(updates.benefits !== undefined && { benefits: updates.benefits || null }),
      ...(updates.salaryMin !== undefined && { salaryMin: updates.salaryMin }),
      ...(updates.salaryMax !== undefined && { salaryMax: updates.salaryMax }),
      ...(updates.experienceLevel !== undefined && { experienceLevel: updates.experienceLevel || null }),
      ...(updates.deadline !== undefined && { deadline: updates.deadline ? new Date(updates.deadline) : null }),
      ...(updates.featured !== undefined && { featured: updates.featured }),
      ...(updates.published !== undefined && { published: updates.published }),
    },
    include: { company: { select: { name: true, logo: true, sector: true } }, _count: { select: { applications: true } } },
  });

  return NextResponse.json({ success: true, job });
}

// DELETE — supprimer une offre
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId manquant" }, { status: 400 });

  await prisma.job.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}
