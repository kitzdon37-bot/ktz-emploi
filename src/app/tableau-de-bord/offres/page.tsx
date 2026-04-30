import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JobsManager from "./JobsManager";

export default async function OffresPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) redirect("/tableau-de-bord/entreprise");

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JobsManager jobs={jobs.map(j => ({ ...j, createdAt: j.createdAt.toISOString() }))} />
    </div>
  );
}
