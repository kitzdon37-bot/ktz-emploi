import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const type = req.nextUrl.searchParams.get("type");

  let csv = "";

  if (type === "users") {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, suspended: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,name,email,role,suspended,createdAt\n";
    csv += users.map((u) =>
      `${u.id},"${(u.name ?? "").replace(/"/g, '""')}","${u.email}",${u.role},${u.suspended},${u.createdAt.toISOString()}`
    ).join("\n");

  } else if (type === "companies") {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true, sector: true, location: true, verified: true, superRecruiter: true, suspended: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,name,sector,location,verified,superRecruiter,suspended,createdAt\n";
    csv += companies.map((c) =>
      `${c.id},"${c.name.replace(/"/g, '""')}","${(c.sector ?? "").replace(/"/g, '""')}","${(c.location ?? "").replace(/"/g, '""')}",${c.verified},${c.superRecruiter},${c.suspended},${c.createdAt.toISOString()}`
    ).join("\n");

  } else if (type === "jobs") {
    const jobs = await prisma.job.findMany({
      select: {
        id: true, title: true, type: true, category: true, location: true,
        published: true, featured: true, views: true, createdAt: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,title,type,category,location,published,featured,views,createdAt,companyName\n";
    csv += jobs.map((j) =>
      `${j.id},"${j.title.replace(/"/g, '""')}",${j.type},"${j.category}","${j.location}",${j.published},${j.featured},${j.views},${j.createdAt.toISOString()},"${j.company.name.replace(/"/g, '""')}"`
    ).join("\n");

  } else if (type === "applications") {
    const apps = await prisma.application.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        job: { select: { title: true, company: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    csv = "id,candidateName,candidateEmail,jobTitle,companyName,status,createdAt\n";
    csv += apps.map((a) =>
      `${a.id},"${(a.user.name ?? "").replace(/"/g, '""')}","${a.user.email}","${a.job.title.replace(/"/g, '""')}","${a.job.company.name.replace(/"/g, '""')}",${a.status},${a.createdAt.toISOString()}`
    ).join("\n");

  } else {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export-${type}.csv"`,
    },
  });
}
