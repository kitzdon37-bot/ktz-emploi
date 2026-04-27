// Rate limiter en mémoire — adapté aux petits déploiements mono-instance
const store = new Map<string, { count: number; resetAt: number }>();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

/**
 * @returns true si la requête est autorisée, false si la limite est atteinte
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
  );
}
