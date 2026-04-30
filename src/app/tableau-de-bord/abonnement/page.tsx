import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import AbonnementClient from "./AbonnementClient";

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export default async function AbonnementPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const company = await prisma.company.findUnique({
    where: { userId },
    include: { subscription: true },
  });

  if (!company) redirect("/tableau-de-bord");

  const activeJobs = await prisma.job.count({
    where: { companyId: company.id, published: true },
  });

  const { plan: defaultPlan } = await searchParams;

  return (
    <Suspense>
      <AbonnementClient
        currentPlan={company.subscription?.plan ?? "FREE"}
        status={company.subscription?.status ?? "ACTIVE"}
        endDate={company.subscription?.endDate?.toISOString() ?? null}
        paymentRef={company.subscription?.paymentRef ?? null}
        activeJobs={activeJobs}
        defaultPlan={defaultPlan ?? null}
      />
    </Suspense>
  );
}
