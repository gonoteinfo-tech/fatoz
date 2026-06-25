import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { backfillImages } from "@/lib/pipeline";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const limit = Number(body.limit) || 30;
  try {
    const result = await backfillImages(limit);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro no backfill." }, { status: 500 });
  }
}
