import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runPipeline } from "@/lib/pipeline";

export const maxDuration = 300;

export async function POST() {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const result = await runPipeline();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro no pipeline." }, { status: 500 });
  }
}
