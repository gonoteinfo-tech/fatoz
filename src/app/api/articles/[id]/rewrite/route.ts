import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rewriteOne } from "@/lib/pipeline";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    await rewriteOne(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao reescrever." }, { status: 500 });
  }
}
