/**
 * Génère un PDF pour chaque candidat dont le champ `cv` est null,
 * le sauvegarde dans public/uploads/cv/ et met à jour la base de données.
 *
 * Usage : tsx scripts/generate-cvs.tsx
 */

import { PrismaClient } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import React from "react";
import ModernPdf from "../src/components/cv/pdf/ModernPdf";
import ClassicPdf from "../src/components/cv/pdf/ClassicPdf";
import CreativePdf from "../src/components/cv/pdf/CreativePdf";
import { CvData, CvTemplate } from "../src/types/cv";

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");

function getDoc(data: CvData, template: CvTemplate) {
  if (template === "classic") return React.createElement(ClassicPdf, { data });
  if (template === "creative") return React.createElement(CreativePdf, { data });
  return React.createElement(ModernPdf, { data });
}

async function main() {
  await mkdir(uploadDir, { recursive: true });

  // Récupérer les candidats sans CV uploadé
  const profiles = await prisma.jobSeekerProfile.findMany({
    where: { cvPublic: true, cv: null },
    include: {
      user: {
        include: { cvBuilder: true },
      },
    },
  });

  console.log(`${profiles.length} profil(s) sans CV trouvé(s)\n`);

  let success = 0;

  for (const profile of profiles) {
    const cvBuilder = profile.user.cvBuilder;
    if (!cvBuilder) {
      console.warn(`⚠ Pas de CV builder pour ${profile.user.name}`);
      continue;
    }

    try {
      const cvData: CvData = JSON.parse(cvBuilder.data);
      const template = (cvBuilder.template as CvTemplate) ?? "modern";

      const doc = getDoc(cvData, template);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buffer = await renderToBuffer(doc as any);

      const filename = `cv_${profile.userId}_${Date.now()}.pdf`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const url = `/uploads/cv/${filename}`;
      await prisma.jobSeekerProfile.update({
        where: { id: profile.id },
        data: { cv: url },
      });

      console.log(`✓ ${profile.user.name} → ${url}`);
      success++;
    } catch (err) {
      console.error(`✗ ${profile.user.name}:`, (err as Error).message);
    }
  }

  console.log(`\n${success}/${profiles.length} CV générés avec succès.`);
  await prisma.$disconnect();
}

main().catch(console.error);
