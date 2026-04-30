import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { userIds, subject, body } = await req.json();
  if (!userIds || !Array.isArray(userIds) || !subject || !body) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { email: true, name: true },
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <div style="color:#374151;font-size:15px;line-height:1.7;white-space:pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">KTZ Emploi · Bangui, République Centrafricaine</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const results: { email: string; sent: boolean; error?: string }[] = [];

  for (const user of users) {
    try {
      await sendEmail({ to: user.email, subject, html });
      results.push({ email: user.email, sent: true });
    } catch (err) {
      results.push({ email: user.email, sent: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
