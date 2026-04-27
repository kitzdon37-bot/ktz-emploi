import jwt from "jsonwebtoken";

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET manquant — définissez-le dans .env");
  return s;
}

export interface MobileTokenPayload {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyMobileToken(token: string): MobileTokenPayload {
  return jwt.verify(token, getSecret()) as MobileTokenPayload;
}
