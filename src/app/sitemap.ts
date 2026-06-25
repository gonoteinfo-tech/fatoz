import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getBaseUrl();

  const [articles, cats] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/copa/onde-ver`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/copa/tabela`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/busca`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${base}/categoria/${encodeURIComponent(c.category)}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/noticia/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
