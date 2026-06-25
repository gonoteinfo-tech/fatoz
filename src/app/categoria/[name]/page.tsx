import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter, ArticleCard, Breadcrumbs } from "@/components/public";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  const settings = await getSettings();
  const title = `${name} — Notícias`;
  const description = `Últimas notícias de ${name} em ${settings.siteName}. ${settings.siteDescription}`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${encodeURIComponent(name)}` },
    openGraph: { title, description, type: "website", siteName: settings.siteName, locale: "pt_BR" },
  };
}

export default async function CategoryPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const settings = await getSettings();

  const [articles, cats] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", category: name },
      orderBy: { publishedAt: "desc" },
      take: 40,
    }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } }),
  ]);

  return (
    <div className="min-h-screen">
      <PublicHeader siteName={settings.siteName} categories={cats.map((c) => c.category)} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: name }]} />
        <h1 className="mb-6 text-2xl font-extrabold">{name}</h1>
        {articles.length === 0 ? (
          <p className="text-slate-500">Nenhuma notícia nesta categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </main>
      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
