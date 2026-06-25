import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter, ArticleCard } from "@/components/public";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  const q = (searchParams.q || "").trim();
  return {
    title: q ? `Busca: ${q}` : "Buscar notícias",
    description: q ? `Resultados da busca por "${q}".` : "Pesquise notícias no site.",
    alternates: { canonical: "/busca" },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const settings = await getSettings();

  const [results, cats] = await Promise.all([
    q
      ? prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { keywords: { contains: q } }],
          },
          orderBy: { publishedAt: "desc" },
          take: 40,
        })
      : Promise.resolve([]),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={settings.siteName} categories={cats.map((c) => c.category)} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-extrabold">Buscar notícias</h1>

        <form action="/busca" method="get" className="mb-8 flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Digite um termo..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500"
            aria-label="Buscar"
          />
          <button className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">Buscar</button>
        </form>

        {q && (
          <p className="mb-6 text-slate-500">
            {results.length} resultado(s) para <span className="font-semibold text-slate-800">“{q}”</span>
          </p>
        )}

        {q && results.length === 0 ? (
          <p className="text-slate-500">Nada encontrado. Tente outro termo ou veja as <Link href="/" className="text-brand-600 underline">últimas notícias</Link>.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {results.map((a) => (
              <ArticleCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </main>

      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
