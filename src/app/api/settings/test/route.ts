import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { testProvider } from "@/lib/ai";

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = await getSettings();
  // mescla com valores do formulário (ainda não salvos) para testar
  const merged = { ...current, ...body };
  const result = await testProvider(merged);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
