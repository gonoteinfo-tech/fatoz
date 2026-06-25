import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Serve a chave do IndexNow para verificação de propriedade pelos buscadores.
export async function GET() {
  const s = await getSettings();
  return new Response(s.indexNowKey || "", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
