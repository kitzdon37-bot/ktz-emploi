import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { page } = await req.json();
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; name?: string; email?: string; role?: string } | undefined;

    await prisma.activityLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        userName: user?.name ?? null,
        type: "PAGE_VIEW",
        label: `Visite : ${page || "/"}`,
        metadata: JSON.stringify({
          page: page || "/",
          role: user?.role ?? "anonymous",
          userAgent: req.headers.get("user-agent") ?? "",
        }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
