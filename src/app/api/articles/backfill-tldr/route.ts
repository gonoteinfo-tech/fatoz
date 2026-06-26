import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { backfillTldrFaq } from "@/lib/pipeline";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const limit = Number(body.limit) || 15;
  try {
    const result = await backfillTldrFaq(limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao regenerar." }, { status: 500 });
  }
}
