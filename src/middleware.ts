import { NextRequest, NextResponse } from "next/server";

const COMING_SOON = true; // passer à false pour rouvrir le site

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return env.split(",").map((o) => o.trim()).filter(Boolean);
}

function resolveCorsOrigin(requestOrigin: string | null): string {
  const allowed = getAllowedOrigins();
  if (!requestOrigin) return allowed[0];
  return allowed.includes(requestOrigin) ? requestOrigin : "null";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mode coming soon — bloquer toutes les pages sauf l'accueil et les API
  if (COMING_SOON && !pathname.startsWith("/api/") && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // CORS pour les routes API
  const origin = request.headers.get("origin");
  const corsOrigin = resolveCorsOrigin(origin);

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
