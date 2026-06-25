import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const settings = await getSettings();
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escape(a.title)}</title>
      <link>${base}/noticia/${a.slug}</link>
      <guid>${base}/noticia/${a.slug}</guid>
      <description>${escape(a.excerpt)}</description>
      <category>${escape(a.category)}</category>
      <pubDate>${(a.publishedAt ?? a.createdAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(settings.siteName)}</title>
    <link>${base}</link>
    <description>${escape(settings.siteDescription)}</description>
    <language>pt-BR</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
