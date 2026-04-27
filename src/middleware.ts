import { NextRequest, NextResponse } from "next/server";

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return env.split(",").map((o) => o.trim()).filter(Boolean);
}

function resolveCorsOrigin(requestOrigin: string | null): string {
  const allowed = getAllowedOrigins();
  if (!requestOrigin) return allowed[0]; // requête sans Origin (apps mobiles, curl) — non contrainte par CORS
  return allowed.includes(requestOrigin) ? requestOrigin : "null"; // origine inconnue → bloquée côté navigateur
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsOrigin = resolveCorsOrigin(origin);

  const corsHeaders = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
