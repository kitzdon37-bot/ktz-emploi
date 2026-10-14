import { NextRequest, NextResponse } from "next/server";

const COMING_SOON = process.env.SHOW_COMING_SOON === "true";

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return env.split(",").map((o) => o.trim()).filter(Boolean);
}

function resolveCorsOrigin(requestOrigin: string | null): string {
  const allowed = getAllowedOrigins();
  if (!requestOrigin) return allowed[0];
  return allowed.includes(requestOrigin) ? requestOrigin : "null";
}

// Adresse unique du site : www.ktzemploi.com redirige vers ktzemploi.com (sinon Google voit
// deux copies du même site). ktz-emploi.vercel.app n'est pas redirigé (la connexion peut en
// dépendre) : la balise canonical de chaque page suffit à indiquer la bonne adresse à Google.
// Les routes /api/ ne sont jamais redirigées (connexion, webhooks).
const CANONICAL_HOST = "ktzemploi.com";
const DUPLICATE_HOSTS = new Set(["www.ktzemploi.com"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const host = (request.headers.get("host") ?? "").toLowerCase();
  if (DUPLICATE_HOSTS.has(host) && !pathname.startsWith("/api/")) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    return NextResponse.redirect(target, 308);
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.pdf).*)"],
};
