import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@ktzemploi.com";
const ADMIN_PASSWORD = "KtzAdmin@2025!";
const ADMIN_NAME = "Donald KITEZE";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    // Mettre à jour le rôle si le compte existe
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "ADMIN" },
    });
    console.log(`✅ Rôle ADMIN mis à jour pour : ${ADMIN_EMAIL}`);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Compte admin créé !");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Mot de passe : ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
