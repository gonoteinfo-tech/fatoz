import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { baseUrlFrom } from "@/lib/seo";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Sitemap de notícias do Google: apenas matérias das últimas 48h.
export async function GET() {
  const settings = await getSettings();
  const base = baseUrlFrom(settings);
  const publisher = settings.publisherName || settings.siteName;

  const since = new Date(Date.now() - 1000 * 60 * 60 * 48);
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: since } },
    orderBy: { publishedAt: "desc" },
    take: 1000,
    select: { slug: true, title: true, publishedAt: true, createdAt: true },
  });

  const items = articles
    .map((a) => {
      const date = (a.publishedAt ?? a.createdAt).toISOString();
      return `  <url>
    <loc>${base}/noticia/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publisher)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
