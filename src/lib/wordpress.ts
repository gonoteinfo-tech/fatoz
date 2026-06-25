import { AppSettings } from "./settings";

interface WpResult {
  id: number;
  link: string;
}

// Publica um artigo num site WordPress via REST API usando Application Password.
export async function publishToWordPress(
  s: AppSettings,
  article: { title: string; content: string; excerpt: string; slug: string; status?: string }
): Promise<WpResult> {
  if (s.wpEnabled !== "true") throw new Error("Integração WordPress desativada.");
  if (!s.wpUrl || !s.wpUser || !s.wpAppPassword) throw new Error("Credenciais do WordPress incompletas.");

  const base = s.wpUrl.replace(/\/$/, "");
  const auth = Buffer.from(`${s.wpUser}:${s.wpAppPassword}`).toString("base64");

  const res = await fetch(`${base}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      slug: article.slug,
      status: article.status || "publish",
    }),
  });

  if (!res.ok) throw new Error(`WordPress API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, link: data.link };
}
