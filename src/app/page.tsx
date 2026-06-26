import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import {
  PublicHeader,
  PublicFooter,
  ArticleCard,
  ArticleListItem,
  SectionHeader,
  HeroBanner,
  TrendingBlock,
  type CardArticle,
} from "@/components/public";
import { CopaBar } from "@/components/copa-bar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 120,
  });

  // Categorias ordenadas pela quantidade de notícias (mais populadas primeiro)
  const byCategory = new Map<string, CardArticle[]>();
  for (const a of articles) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }
  const categories = [...byCategory.keys()].sort(
    (x, y) => (byCategory.get(y)!.length - byCategory.get(x)!.length)
  );

  // Destaque do topo: as 6 notícias mais recentes (1 principal + 5 cards)
  const hero = articles.slice(0, 6);
  const heroIds = new Set(hero.map((a) => a.slug));

  // Em alta: as mais lidas (por visualizações), sem repetir o destaque
  const trending = [...articles]
    .sort((a, b) => b.views - a.views)
    .filter((a) => !heroIds.has(a.slug) && a.views > 0)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={settings.siteName} categories={categories} />
      <CopaBar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <HeroBanner image={settings.heroImage} title={settings.heroTitle} subtitle={settings.heroSubtitle} link={settings.heroLink} />
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-300 bg-white p-12 text-center">
            <h2 className="text-xl font-bold">Nenhuma notícia publicada ainda</h2>
            <p className="mt-2 text-slate-500">
              Acesse o <a className="font-semibold text-brand-600 underline" href="/admin">painel</a>, adicione feeds RSS
              e gere conteúdo automaticamente.
            </p>
          </div>
        ) : (
          <>
            {/* DESTAQUE PRINCIPAL */}
            <section className="mb-12">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {hero[0] && <ArticleCard a={hero[0]} featured />}
                {hero.slice(1, 6).map((a) => (
                  <ArticleCard key={a.slug} a={a} />
                ))}
              </div>
            </section>

            {/* EM ALTA */}
            <TrendingBlock items={trending} />

            {/* SEÇÕES POR CATEGORIA */}
            {categories.map((cat) => {
              const list = byCategory.get(cat)!.filter((a) => !heroIds.has(a.slug));
              if (list.length === 0) return null;
              const [first, ...rest] = list;
              return (
                <section key={cat} className="mb-12">
                  <SectionHeader category={cat} href={`/categoria/${encodeURIComponent(cat)}`} />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <ArticleCard a={first} featured />
                    <div className="space-y-3 md:col-span-1">
                      {rest.slice(0, 4).map((a) => (
                        <ArticleListItem key={a.slug} a={a} />
                      ))}
                    </div>
                  </div>
                  {rest.length > 4 && (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {rest.slice(4, 8).map((a) => (
                        <ArticleCard key={a.slug} a={a} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}
      </main>

      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
