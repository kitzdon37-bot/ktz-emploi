import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostJobForm from "./PostJobForm";

export default async function PublierPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });

  if (!company) redirect("/tableau-de-bord/entreprise");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publier une offre d&apos;emploi</h1>
        <p className="text-gray-500 mt-1">Décrivez le poste pour attirer les meilleurs candidats</p>
      </div>
      <PostJobForm companyId={company.id} />
    </div>
  );
}

