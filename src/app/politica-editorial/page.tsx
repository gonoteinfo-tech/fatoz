import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter, Breadcrumbs } from "@/components/public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Política editorial",
    description: `Como o ${s.siteName} produz, apura e revisa o conteúdo publicado.`,
    alternates: { canonical: "/politica-editorial" },
  };
}

export default async function PoliticaEditorialPage() {
  const s = await getSettings();
  const cats = await prisma.article.findMany({ where: { status: "PUBLISHED" }, distinct: ["category"], select: { category: true } });

  const custom = s.editorialPolicyText?.trim();

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={s.siteName} categories={cats.map((c) => c.category)} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Política editorial" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight">Política editorial</h1>

        {custom ? (
          <div className="article-body mt-6 whitespace-pre-line text-slate-700">{custom}</div>
        ) : (
          <div className="article-body mt-6 text-slate-700">
            <p>
              O {s.siteName} tem o compromisso de informar com clareza, agilidade e responsabilidade. Esta página explica
              como nosso conteúdo é produzido, revisado e corrigido.
            </p>
            <h2>Produção do conteúdo</h2>
            <p>
              Acompanhamos diversas fontes e veículos de imprensa e produzimos resumos e versões próprias das notícias,
              com apoio de tecnologia de inteligência artificial sob curadoria editorial. O objetivo é organizar a
              informação e facilitar a compreensão dos fatos.
            </p>
            <h2>Fontes</h2>
            <p>
              Sempre que possível, indicamos a origem da informação. As notícias são baseadas em fatos divulgados por
              fontes públicas e veículos de comunicação. Incentivamos o leitor a consultar também as fontes originais.
            </p>
            <h2>Verificação e correções</h2>
            <p>
              Buscamos a precisão das informações. Caso identifique algum erro, entre em contato
              {s.contactEmail ? <> pelo e-mail <a href={`mailto:${s.contactEmail}`} className="text-brand-600 underline">{s.contactEmail}</a></> : null}.
              Correções relevantes são aplicadas e sinalizadas quando necessário.
            </p>
            <h2>Independência</h2>
            <p>
              Nosso conteúdo editorial é independente. Eventuais conteúdos publicitários são identificados como tal.
            </p>
          </div>
        )}
      </main>
      <PublicFooter siteName={s.siteName} />
    </div>
  );
}
