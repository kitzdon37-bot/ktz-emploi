import { NextRequest, NextResponse } from "next/server";

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return env.split(",").map((o) => o.trim()).filter(Boolean);
}

export function corsHeaders(requestOrigin?: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  const origin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

export function handleOptions(req?: NextRequest): NextResponse {
  const origin = req?.headers.get("origin") ?? null;
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export function withCors(response: NextResponse, req?: NextRequest): NextResponse {
  const origin = req?.headers.get("origin") ?? null;
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
