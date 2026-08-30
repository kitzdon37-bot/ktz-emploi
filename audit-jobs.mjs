import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const today = new Date();

const expired = await prisma.job.findMany({
  where: { deadline: { lt: today } },
  select: { id: true, title: true, deadline: true, company: { select: { name: true } } },
  orderBy: { deadline: "asc" },
});

const active = await prisma.job.findMany({
  where: { published: true, OR: [{ deadline: null }, { deadline: { gte: today } }] },
  select: { id: true, title: true, deadline: true, company: { select: { name: true } } },
  orderBy: { createdAt: "desc" },
});

const noDead = await prisma.job.count({ where: { deadline: null } });

console.log(`Aujourd'hui : ${today.toISOString().slice(0, 10)}`);
console.log(`\n=== OFFRES EXPIRÉES (${expired.length}) ===`);
for (const j of expired) {
  console.log(`- [${j.deadline?.toISOString().slice(0,10)}] ${j.company.name} — ${j.title}`);
}

console.log(`\n=== OFFRES ACTIVES (${active.length}) ===`);
for (const j of active) {
  console.log(`- [${j.deadline?.toISOString().slice(0,10) ?? "sans date"}] ${j.company.name} — ${j.title}`);
}

console.log(`\nOffres sans date limite : ${noDead}`);

await prisma.$disconnect();
