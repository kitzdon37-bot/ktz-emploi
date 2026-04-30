import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TemplatesClient, { type JobTemplate } from "./TemplatesClient";

export default async function ModelesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord/modeles");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });

  if (!company) {
    redirect("/tableau-de-bord");
  }

  const rawTemplates = await prisma.jobTemplate.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  const templates: JobTemplate[] = rawTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    title: t.title,
    type: t.type,
    category: t.category,
    location: t.location,
    description: t.description,
    requirements: t.requirements,
    benefits: t.benefits,
    salaryMin: t.salaryMin,
    salaryMax: t.salaryMax,
    createdAt: t.createdAt.toISOString(),
  }));

  return <TemplatesClient initialTemplates={templates} />;
}
