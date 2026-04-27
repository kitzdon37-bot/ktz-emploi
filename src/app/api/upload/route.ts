import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Vérification des magic bytes pour s'assurer que le contenu correspond au type déclaré
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    case "image/gif":
      return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    case "image/webp":
      return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    case "application/pdf":
      return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    case "image/svg+xml":
      // SVG est du XML texte — on vérifie juste la présence de '<svg' ou '<?xml'
      const text = buffer.slice(0, 100).toString("utf8").trimStart();
      return text.startsWith("<svg") || text.startsWith("<?xml") || text.startsWith("<!--");
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });

    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    const validTypes = [...imageTypes, "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (JPG, PNG, WEBP, SVG, PDF)" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 5 Mo)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vérification du contenu réel (magic bytes) pour éviter les fichiers renommés
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "Contenu du fichier invalide" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf";
    const uploadType = formData.get("type") as string | null;
    const isJobCover = !isPdf && uploadType === "job-cover";
    const subDir = isPdf ? "cv" : isJobCover ? "job-covers" : "logos";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
    await mkdir(uploadDir, { recursive: true });

    const ext = (file.name.split(".").pop() || (isPdf ? "pdf" : "jpg")).toLowerCase().replace(/[^a-z0-9]/g, "");
    const prefix = isPdf ? "cv" : isJobCover ? "cover" : "logo";
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${subDir}/${filename}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
