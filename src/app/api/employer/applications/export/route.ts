import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string }).role;

  if (role !== "EMPLOYER") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    include: {
      job: { select: { title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const header = ["Nom du candidat", "Email", "Poste", "Statut", "Date de candidature"];

  const rows = applications.map((app) => {
    const name = (app.user.name ?? "").replace(/"/g, '""');
    const email = (app.user.email ?? "").replace(/"/g, '""');
    const jobTitle = (app.job.title ?? "").replace(/"/g, '""');
    const status = (app.status ?? "").replace(/"/g, '""');
    const date = app.createdAt.toISOString().slice(0, 10);
    return [`"${name}"`, `"${email}"`, `"${jobTitle}"`, `"${status}"`, `"${date}"`].join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="candidatures.csv"',
    },
  });
}
