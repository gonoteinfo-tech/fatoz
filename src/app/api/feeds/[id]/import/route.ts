import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { importFeed } from "@/lib/pipeline";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const created = await importFeed(params.id);
    return NextResponse.json({ ok: true, created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao importar feed." }, { status: 500 });
  }
}
