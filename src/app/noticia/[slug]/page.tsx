import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter, ArticleCard, Breadcrumbs } from "@/components/public";
import { NewsSidebar } from "@/components/news-sidebar";
import { readingTime, baseUrlFrom, wordCount, organizationLd } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  return prisma.article.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [a, settings] = await Promise.all([getArticle(params.slug), getSettings()]);
  if (!a) return { title: "Notícia não encontrada", robots: { index: false, follow: false } };
  const base = baseUrlFrom(settings);
  const url = `${base}/noticia/${a.slug}`;
  const title = a.metaTitle || a.title;
  const description = a.metaDescription || a.excerpt;
  const images = a.imageUrl ? [a.imageUrl] : settings.ogImage ? [settings.ogImage] : [];

  return {
    title,
    description,
    keywords: a.keywords,
    alternates: { canonical: `/noticia/${a.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: settings.siteName,
      locale: "pt_BR",
      publishedTime: a.publishedAt?.toISOString(),
      modifiedTime: a.updatedAt.toISOString(),
      section: a.category,
      tags: a.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: settings.twitterHandle || undefined,
      images,
    },
  };
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const settings = await getSettings();
  const article = await getArticle(params.slug);
  if (!article) notFound();

  // contabiliza visualização
  await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });

  const related = await prisma.article.findMany({
    where: { status: "PUBLISHED", category: article.category, NOT: { id: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  const base = baseUrlFrom(settings);
  const url = `${base}/noticia/${article.slug}`;
  const tags = article.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const publisherName = settings.publisherName || settings.siteName;
  const publisherLogo = settings.ogImage || `${base}/fatoz-logo.svg`;

  const newsLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title.slice(0, 110),
    description: article.metaDescription || article.excerpt,
    image: article.imageUrl ? [article.imageUrl] : [`${base}/fatoz-logo.svg`],
    datePublished: (article.publishedAt ?? article.createdAt).toISOString(),
    dateModified: article.updatedAt.toISOString(),
    articleSection: article.category,
    keywords: article.keywords || tags.join(", "),
    wordCount: wordCount(article.content),
    inLanguage: "pt-BR",
    author: { "@type": "Organization", name: publisherName, url: base },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: { "@type": "ImageObject", url: publisherLogo },
    },
    ...(article.sourceUrl ? { isBasedOn: article.sourceUrl } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: article.category, item: `${base}/categoria/${encodeURIComponent(article.category)}` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen">
      <PublicHeader siteName={settings.siteName} categories={[]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            { label: article.category, href: `/categoria/${encodeURIComponent(article.category)}` },
            { label: article.title },
          ]}
        />

        <article>
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {article.category}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{article.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
            <span>{fmtDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{readingTime(article.content)} min de leitura</span>
            <span>•</span>
            <span>{article.views} visualizações</span>
          </div>

          {article.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt={article.title}
              className="mt-6 w-full rounded-xl"
              width={1200}
              height={675}
              fetchPriority="high"
              decoding="async"
            />
          )}

          <div
            className="article-body mt-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {article.sourceUrl && (
            <p className="mt-6 text-xs text-slate-400">
              Baseado em informações de{" "}
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline">
                fonte original
              </a>
              .
            </p>
          )}
        </article>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-bold">Relacionadas</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {related.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          </section>
        )}
          </div>

          {/* Sidebar: clima animado, anúncios e mais lidas */}
          <div className="lg:col-span-1">
            <NewsSidebar excludeId={article.id} category={article.category} />
          </div>
        </div>
      </main>

      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
