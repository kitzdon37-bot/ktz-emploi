import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const DOCUMENT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("cv") as File | null;
  // Pièces justificatives (diplômes, attestations) : les photos sont aussi acceptées
  const isDocument = formData.get("kind") === "document";
  const allowed = isDocument ? [...ALLOWED_TYPES, ...DOCUMENT_IMAGE_TYPES] : ALLOWED_TYPES;

  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Fichier trop lourd (max 5 Mo)" }, { status: 400 });
  if (!allowed.includes(file.type)) {
    return NextResponse.json({
      error: isDocument ? "Format invalide. PDF, Word, JPG ou PNG uniquement." : "Format invalide. PDF ou Word uniquement.",
    }, { status: 400 });
  }

  const userId = (session.user as { id?: string }).id!;
  const ext = file.name.split(".").pop();
  const filename = isDocument
    ? `documents/doc_${userId}_${Date.now()}.${ext}`
    : `cv/cv_${userId}_${Date.now()}.${ext}`;

  const blob = await put(filename, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
