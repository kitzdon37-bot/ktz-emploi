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
  // Désactivé en localhost pour continuer le développement
  const hostname = request.nextUrl.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isAdminRoute = pathname.startsWith("/tableau-de-bord") || pathname.startsWith("/connexion");
  if (COMING_SOON && !isLocalhost && !pathname.startsWith("/api/") && pathname !== "/" && !isAdminRoute) {
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
