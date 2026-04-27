import { NextRequest } from "next/server";
import { verifyMobileToken, MobileTokenPayload } from "./jwt-mobile";

export function getMobileUser(req: NextRequest): MobileTokenPayload | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return verifyMobileToken(auth.slice(7));
  } catch {
    return null;
  }
}
