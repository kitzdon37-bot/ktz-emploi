import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AlertesClient from "./AlertesClient";

export default async function AlertesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id!;

  const alerts = await prisma.jobAlert.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      keywords: true,
      location: true,
      frequency: true,
      createdAt: true,
    },
  });

  // Sérialise les dates pour le passage au client
  const serializedAlerts = alerts.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return <AlertesClient initialAlerts={serializedAlerts} />;
}
