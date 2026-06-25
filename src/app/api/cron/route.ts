import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

export const maxDuration = 300;

// Endpoint para automação via cron externo (ex: Vercel Cron, cron-job.org).
// Proteja com o cabeçalho Authorization: Bearer <CRON_SECRET>
// ou com ?secret=<CRON_SECRET>.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const qs = req.nextUrl.searchParams.get("secret");
  const provided = auth?.replace(/^Bearer\s+/i, "") || qs;

  if (secret && provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await runPipeline();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro no pipeline." }, { status: 500 });
  }
}
