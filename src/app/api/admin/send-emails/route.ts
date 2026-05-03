import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendJobMatchEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { candidateIds } = await req.json() as { candidateIds: string[] };

  const results: { email: string; sent: boolean; jobCount: number; error?: string }[] = [];

  for (const userId of candidateIds) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || user.role !== "JOBSEEKER") continue;

    // Algorithme de matching : cherche des offres selon titre/localité du profil
    const keywords = user.profile?.title?.split(" ").filter((w) => w.length > 3) ?? [];
    const location = user.profile?.location ?? "";

    const jobs = await prisma.job.findMany({
      where: {
        published: true,
        OR: [
          ...(keywords.length > 0
            ? keywords.map((kw) => ({ title: { contains: kw, mode: 'insensitive' as const } }))
            : []),
          ...(location ? [{ location: { contains: location, mode: 'insensitive' as const } }] : []),
          // Si pas de profil → envoie les 3 offres les plus récentes
          ...(keywords.length === 0 && !location ? [{ published: true }] : []),
        ],
      },
      include: { company: { select: { name: true, logo: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 5,
    });

    if (jobs.length === 0) {
      results.push({ email: user.email, sent: false, jobCount: 0 });
      continue;
    }

    const result = await sendJobMatchEmail({
      name: user.name ?? user.email,
      email: user.email,
      jobs,
    });

    results.push({ email: user.email, sent: result.success, jobCount: jobs.length, error: result.error });
  }

  const sent = results.filter((r) => r.sent).length;
  return NextResponse.json({ results, sent, total: results.length });
}
