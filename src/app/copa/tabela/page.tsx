import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter } from "@/components/public";
import { CopaBar } from "@/components/copa-bar";
import { flagUrl, type TeamStanding } from "@/lib/copa";
import { getCopaStandings } from "@/lib/copa-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tabela da Copa — Classificação dos grupos",
  description: "Classificação por grupos da Copa 2026: pontos, jogos, vitórias, saldo de gols e gols pró.",
  alternates: { canonical: "/copa/tabela" },
  openGraph: { title: "Tabela da Copa — Classificação dos grupos", type: "website", locale: "pt_BR" },
};

function Row({ s, pos }: { s: TeamStanding; pos: number }) {
  const qualifies = pos <= 2;
  return (
    <tr className={pos <= 2 ? "bg-green-50/60" : ""}>
      <td className="py-2 pl-3 pr-1">
        <span
          className={`grid h-5 w-5 place-items-center rounded text-xs font-bold ${
            qualifies ? "bg-green-600 text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {pos}
        </span>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(s.team.flag, 40)} alt={s.team.name} className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200" loading="lazy" />
          <span className="font-semibold text-slate-800">{s.team.name}</span>
        </div>
      </td>
      <td className="py-2 text-center font-extrabold text-slate-900">{s.points}</td>
      <td className="py-2 text-center text-slate-500">{s.played}</td>
      <td className="hidden py-2 text-center text-slate-500 sm:table-cell">{s.win}</td>
      <td className="hidden py-2 text-center text-slate-500 sm:table-cell">{s.draw}</td>
      <td className="hidden py-2 text-center text-slate-500 sm:table-cell">{s.loss}</td>
      <td className="py-2 text-center text-slate-500">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
    </tr>
  );
}

export default async function TabelaPage() {
  const settings = await getSettings();
  const cats = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["category"],
    select: { category: true },
  });
  const { source, standings } = await getCopaStandings();
  const started = standings.some((g) => g.table.some((t) => t.played > 0));

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={settings.siteName} categories={cats.map((c) => c.category)} />
      <CopaBar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <span className="text-3xl font-black italic tracking-tight">
            <span className="text-green-600">COPA</span>
            <span className="mx-0.5 text-yellow-400">★</span>
            <span className="text-blue-600">26</span>
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Tabela · Classificação dos grupos</h1>
          <p className="mt-1 text-slate-500">
            Classificação real da fase de grupos da Copa 2026. Os <span className="font-semibold text-green-700">2 primeiros</span> de
            cada grupo (e os 8 melhores terceiros) avançam ao mata-mata.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Link href="/copa/onde-ver" className="font-bold text-blue-600 hover:underline">Próximos jogos · Onde ver ›</Link>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                source === "api" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${source === "api" ? "bg-green-500" : "bg-amber-500"}`} />
              {source === "api" ? "Dados ao vivo · API-Football" : "Dados de exemplo · configure a API-Football"}
            </span>
          </div>
        </header>

        {!started && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Fase de grupos em andamento.</strong> Assim que os placares forem lançados, a classificação
            (pontos, vitórias e saldo) é calculada automaticamente. Os jogos e seus horários estão em{" "}
            <Link href="/copa/onde-ver" className="font-semibold underline">Próximos jogos</Link>.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {standings.map(({ group, table }) => (
            <section key={group} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-brand-600 px-4 py-2.5">
                <h2 className="font-black uppercase tracking-wide text-white">{group}</h2>
                <span className="text-xs font-semibold text-brand-100">{table.length} seleções</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                    <th className="py-2 pl-3 text-left">#</th>
                    <th className="py-2 text-left">Seleção</th>
                    <th className="py-2 text-center" title="Pontos">P</th>
                    <th className="py-2 text-center" title="Jogos">J</th>
                    <th className="hidden py-2 text-center sm:table-cell" title="Vitórias">V</th>
                    <th className="hidden py-2 text-center sm:table-cell" title="Empates">E</th>
                    <th className="hidden py-2 text-center sm:table-cell" title="Derrotas">D</th>
                    <th className="py-2 text-center" title="Saldo de gols">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {table.map((s, i) => (
                    <Row key={s.team.code} s={s} pos={i + 1} />
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          P: pontos · J: jogos · V: vitórias · E: empates · D: derrotas · SG: saldo de gols.
        </p>
      </main>

      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
