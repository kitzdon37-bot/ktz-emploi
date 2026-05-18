import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CvBuilderClient from "@/components/cv/CvBuilderClient";
import { CvData, CvTemplate } from "@/types/cv";

export const metadata = { title: "Créateur de CV — KTZ Emploi" };

export default async function CvBuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord/cv/builder");

  const userId = (session.user as { id: string }).id;
  const existing = await prisma.cvBuilder.findUnique({ where: { userId } });

  const initial = {
    data: existing ? (JSON.parse(existing.data) as CvData) : null,
    template: (existing?.template ?? "modern") as CvTemplate,
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <CvBuilderClient initial={initial} />
    </div>
  );
}
