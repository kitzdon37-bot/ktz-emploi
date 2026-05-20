import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CvthequeClient from "./CvthequeClient";

export default async function CvthequePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER" && role !== "ADMIN") redirect("/tableau-de-bord");

  const [candidates, employer] = await Promise.all([
    prisma.jobSeekerProfile.findMany({
      where: { cvPublic: true },
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { email: session.user!.email! },
      select: { name: true, company: { select: { name: true } } },
    }),
  ]);

  const data = candidates.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.user.name,
    email: c.user.email ?? c.user.phone ?? "",
    phone: c.phone,
    title: c.title,
    location: c.location,
    skills: c.skills,
    bio: c.bio,
    cv: c.cv ?? "",
    updatedAt: c.updatedAt.toISOString(),
    experience: c.experience,
    education: c.education,
  }));

  return (
    <CvthequeClient
      candidates={data}
      recruiterName={employer?.name ?? null}
      companyName={employer?.company?.name ?? null}
    />
  );
}
