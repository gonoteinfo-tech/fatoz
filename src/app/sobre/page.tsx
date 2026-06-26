import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter, Breadcrumbs } from "@/components/public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: `Sobre o ${s.siteName}`,
    description: `Conheça o ${s.siteName}: ${s.siteDescription}`,
    alternates: { canonical: "/sobre" },
  };
}

export default async function SobrePage() {
  const s = await getSettings();
  const cats = await prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } });

  const about =
    s.aboutText ||
    `O ${s.siteName} é um portal de notícias dedicado a manter você bem informado sobre o que acontece no Brasil e no mundo. Nossa cobertura abrange política, economia, esportes, tecnologia, ciência, saúde e entretenimento, com atualização contínua e linguagem clara.

Nosso objetivo é entregar informação relevante de forma rápida, organizada e acessível, ajudando o leitor a entender os fatos que importam.`;

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={s.siteName} categories={cats.map((c) => c.category)} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Sobre" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight">Sobre o {s.siteName}</h1>
        {s.siteTagline && <p className="mt-2 text-lg text-slate-500">{s.siteTagline}</p>}

        <div className="article-body mt-6 whitespace-pre-line text-slate-700">{about}</div>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Redação</h2>
          <p className="mt-1 font-semibold text-slate-800">{s.authorName}</p>
          {s.authorBio && <p className="mt-1 text-slate-600">{s.authorBio}</p>}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Contato</h2>
          {s.contactEmail ? (
            <p className="mt-1 text-slate-600">
              E-mail: <a href={`mailto:${s.contactEmail}`} className="text-brand-600 underline">{s.contactEmail}</a>
            </p>
          ) : (
            <p className="mt-1 text-slate-500">Em breve.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {s.socialInstagram && <a href={s.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Instagram</a>}
            {s.socialFacebook && <a href={s.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">Facebook</a>}
            {s.socialTwitter && <a href={s.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">X</a>}
            {s.socialYoutube && <a href={s.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">YouTube</a>}
          </div>
        </section>

        <p className="mt-8 text-sm text-slate-500">
          Veja também nossa <Link href="/politica-editorial" className="text-brand-600 underline">Política editorial</Link>.
        </p>
      </main>
      <PublicFooter siteName={s.siteName} />
    </div>
  );
}
