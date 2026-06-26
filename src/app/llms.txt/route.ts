import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { baseUrlFrom } from "@/lib/seo";

export const dynamic = "force-dynamic";

// llms.txt — guia para assistentes de IA (padrão llmstxt.org).
export async function GET() {
  const settings = await getSettings();
  const base = baseUrlFrom(settings);

  const [cats, recent] = await Promise.all([
    prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { title: true, slug: true, excerpt: true },
    }),
  ]);

  const categoryLinks = cats
    .map((c) => `- [${c.category}](${base}/categoria/${encodeURIComponent(c.category)})`)
    .join("\n");

  const recentLinks = recent
    .map((a) => `- [${a.title}](${base}/noticia/${a.slug}): ${a.excerpt}`)
    .join("\n");

  const body = `# ${settings.siteName}

> ${settings.siteDescription}

${settings.siteName} é um portal de notícias do Brasil e do mundo, com cobertura de política, economia, esportes, tecnologia, ciência, saúde e entretenimento. Conteúdo atualizado continuamente.

## Categorias
${categoryLinks}

## Últimas notícias
${recentLinks}

## Recursos
- [Sitemap](${base}/sitemap.xml)
- [Sitemap de notícias](${base}/news-sitemap.xml)
- [Feed RSS](${base}/feed.xml)

## Sobre
- Site: ${base}
- Idioma: Português (Brasil)
${settings.contactEmail ? `- Contato: ${settings.contactEmail}` : ""}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=600" },
  });
}
