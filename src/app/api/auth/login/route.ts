import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }
  if (!checkCredentials(email, password)) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }
  setSessionCookie(createSessionToken(email));
  return NextResponse.json({ ok: true });
}
