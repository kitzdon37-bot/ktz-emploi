import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — liste toutes les entreprises
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const companies = await prisma.company.findMany({
    select: {
      id: true, name: true, logo: true, sector: true,
      verified: true, superRecruiter: true, suspended: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ companies });
}

// PATCH — toggle superRecruiter ou verified
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { companyId, field, value } = await req.json();
  if (!companyId || !["superRecruiter", "verified", "suspended"].includes(field)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: companyId },
    data: { [field]: value },
    select: { name: true, superRecruiter: true, verified: true },
  });

  return NextResponse.json({ success: true, company });
}
