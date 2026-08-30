import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const today = new Date();
today.setHours(23, 59, 59, 999); // fin de journée incluse

// D'abord supprimer les candidatures liées aux offres expirées
const expiredJobs = await prisma.job.findMany({
  where: { deadline: { lt: today } },
  select: { id: true, title: true },
});

console.log(`Offres à supprimer : ${expiredJobs.length}`);

for (const job of expiredJobs) {
  // Supprimer les dépendances dans l'ordre
  await prisma.application.deleteMany({ where: { jobId: job.id } });
  await prisma.savedJob.deleteMany({ where: { jobId: job.id } });
  await prisma.job.delete({ where: { id: job.id } });
  console.log(`✓ Supprimé : ${job.title}`);
}

const remaining = await prisma.job.count({ where: { published: true } });
console.log(`\nOffres restantes sur le site : ${remaining}`);

await prisma.$disconnect();
