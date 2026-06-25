import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PublicHeader, PublicFooter } from "@/components/public";
import { CopaBar } from "@/components/copa-bar";
import { flagUrl, type CopaTeam } from "@/lib/copa";
import { getCopaGroupedMatches } from "@/lib/copa-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Próximos jogos da Copa — Onde ver",
  description: "Tabela de próximos jogos da Copa: datas, horários, seleções, grupos e onde assistir na TV e streaming.",
  alternates: { canonical: "/copa/onde-ver" },
  openGraph: { title: "Próximos jogos da Copa — Onde ver", type: "website", locale: "pt_BR" },
};

function TeamSide({ team, align }: { team: CopaTeam; align: "left" | "right" }) {
  return (
    <div className={`flex flex-1 items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl(team.flag)}
        alt={team.name}
        className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
        loading="lazy"
      />
      <div className={align === "right" ? "items-end" : ""}>
        <p className="font-bold leading-tight text-slate-900">{team.name}</p>
        <p className="text-xs font-semibold text-slate-400">{team.code}</p>
      </div>
    </div>
  );
}

export default async function OndeVerPage() {
  const settings = await getSettings();
  const cats = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["category"],
    select: { category: true },
  });
  const { source, groups } = await getCopaGroupedMatches();

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader siteName={settings.siteName} categories={cats.map((c) => c.category)} />
      <CopaBar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <span className="text-3xl font-black italic tracking-tight">
            <span className="text-green-600">COPA</span>
            <span className="mx-0.5 text-yellow-400">★</span>
            <span className="text-blue-600">26</span>
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Próximos jogos · Onde ver</h1>
          <p className="mt-1 text-slate-500">
            Jogos da fase de grupos da Copa 2026 — datas, horários (Brasília), grupos e placares.
          </p>
          <span
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
              source === "api" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${source === "api" ? "bg-green-500" : "bg-amber-500"}`} />
            {source === "api" ? "Dados ao vivo · API-Football" : "Dados de exemplo · configure a API-Football no painel"}
          </span>
        </header>

        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.date}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-600 text-xs text-white">📅</span>
                {g.date}
              </h2>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {g.matches.map((m, i) => (
                  <div key={m.id} className={`p-4 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                    <div className="mb-3 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">{m.stage}</span>
                      <span className="font-semibold text-slate-400">{m.time} (Brasília)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <TeamSide team={m.home} align="left" />
                      <div className="flex shrink-0 flex-col items-center">
                        {typeof m.homeScore === "number" && typeof m.awayScore === "number" ? (
                          <>
                            <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm font-black text-white">
                              {m.homeScore} <span className="text-slate-400">×</span> {m.awayScore}
                            </span>
                            <span className="mt-1 text-[10px] font-semibold uppercase text-slate-400">encerrado</span>
                          </>
                        ) : (
                          <>
                            <span className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-black text-white">{m.time}</span>
                            <span className="mt-1 text-[10px] font-semibold uppercase text-slate-400">Brasília</span>
                          </>
                        )}
                      </div>
                      <TeamSide team={m.away} align="right" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold uppercase text-slate-400">Onde ver:</span>
                      {(m.channels.length ? m.channels : ["CazéTV", "Globo", "SBT"]).map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                            <rect x="2" y="4" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 18v3" strokeLinecap="round" />
                          </svg>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Programação e canais sujeitos a alteração. Confira sempre a grade oficial das emissoras.
        </p>
      </main>

      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
