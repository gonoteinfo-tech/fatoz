import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getBaseUrl();
  // Libera explicitamente os principais robôs de IA (queremos tráfego/citações
  // de ChatGPT, Perplexity, Gemini, Copilot, Claude, etc.).
  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "CCBot",
    "Amazonbot",
    "Bytespider",
    "Meta-ExternalAgent",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/login"] },
      { userAgent: aiBots, allow: "/", disallow: ["/admin", "/api", "/login"] },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/news-sitemap.xml`],
    host: base,
  };
}
