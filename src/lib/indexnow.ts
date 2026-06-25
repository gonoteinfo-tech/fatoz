import crypto from "crypto";
import { getSettings, saveSettings } from "./settings";
import { baseUrlFrom } from "./seo";

// Notifica os buscadores compatíveis com IndexNow (Bing, Yandex e outros)
// sobre URLs novas/atualizadas, para indexação mais rápida.
// A chave é gerada automaticamente na primeira chamada e servida em /indexnow-key.txt.
export async function pingIndexNow(paths: string[]): Promise<void> {
  try {
    if (!paths.length) return;
    const settings = await getSettings();
    const base = baseUrlFrom(settings);
    const host = new URL(base).host;
    if (host.includes("localhost") || host.includes("127.0.0.1")) return; // não pinga em dev

    let key = settings.indexNowKey;
    if (!key) {
      key = crypto.randomBytes(16).toString("hex");
      await saveSettings({ indexNowKey: key });
    }

    const urlList = paths.map((p) => (/^https?:\/\//.test(p) ? p : `${base}${p.startsWith("/") ? p : `/${p}`}`));

    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${base}/indexnow-key.txt`,
        urlList,
      }),
    });
  } catch {
    /* silencioso — não deve quebrar a publicação */
  }
}
