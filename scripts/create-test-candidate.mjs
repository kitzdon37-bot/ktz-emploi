import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "candidat.test@ktzemploi.cf";
  const password = await bcrypt.hash("Test1234!", 10);

  // Créer l'utilisateur
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Alain Doumbe",
      email,
      password,
      role: "JOBSEEKER",
    },
  });

  // Créer le profil candidat avec numéro WhatsApp
  await prisma.jobSeekerProfile.upsert({
    where: { userId: user.id },
    update: {
      phone: "+236625345175",
    },
    create: {
      userId: user.id,
      title: "Développeur Web Junior",
      bio: "Passionné de développement web, à la recherche d'opportunités en Centrafrique.",
      phone: "+236625345175",
      location: "Bangui",
      skills: "JavaScript, HTML, CSS, React, Node.js",
      cvPublic: true,
      cv: "https://example.com/cv-alain-doumbe.pdf",
    },
  });

  console.log("✅ Candidat créé :", user.name, "(", email, ")");
  console.log("   Téléphone WhatsApp : +236625345175");
}

main()
  .catch((e) => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
