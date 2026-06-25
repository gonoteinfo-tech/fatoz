import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "labnews_session";
const SECRET = process.env.AUTH_SECRET || "insecure-dev-secret";

function sign(payload: string): string {
  const h = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${h}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return payload;
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@labnews.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;
}

export function createSessionToken(email: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 dias
  return sign(`${email}|${exp}`);
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSession(): { email: string } | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  const [email, expStr] = payload.split("|");
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;
  return { email };
}

export function requireSession(): { email: string } {
  const s = getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}
