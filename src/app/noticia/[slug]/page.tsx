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
  const authorName = settings.authorName || publisherName;

  // TL;DR e FAQ (JSON salvos pela IA)
  const safeParse = <T,>(s: string, fallback: T): T => {
    try {
      const v = JSON.parse(s || "");
      return Array.isArray(v) ? (v as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const keyPoints = safeParse<string[]>(article.keyPoints, []);
  const faq = safeParse<{ pergunta: string; resposta: string }[]>(article.faq, []);

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
    author: { "@type": "Person", name: authorName, url: `${base}/sobre` },
    publisher: {
      "@type": "Organization",
      name: publisherName,
      logo: { "@type": "ImageObject", url: publisherLogo },
    },
    ...(article.sourceUrl ? { isBasedOn: article.sourceUrl } : {}),
  };

  const faqLd =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.pergunta,
            acceptedAnswer: { "@type": "Answer", text: f.resposta },
          })),
        }
      : null;

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
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

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
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
            <span className="font-semibold text-slate-600">Por {authorName}</span>
            <span>•</span>
            <span>{fmtDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{readingTime(article.content)} min de leitura</span>
            <span>•</span>
            <span>{article.views} visualizações</span>
          </div>

          {keyPoints.length > 0 && (
            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-brand-700">Em resumo</p>
              <ul className="space-y-1.5">
                {keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          {faq.length > 0 && (
            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="mb-4 text-xl font-extrabold">Perguntas frequentes</h2>
              <div className="space-y-3">
                {faq.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 open:border-brand-200">
                    <summary className="cursor-pointer list-none font-semibold text-slate-800 marker:hidden">
                      <span className="text-brand-600">{"▸ "}</span>
                      {f.pergunta}
                    </summary>
                    <p className="mt-2 text-slate-600">{f.resposta}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

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
