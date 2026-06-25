import Link from "next/link";
import { flagUrl, type CopaTeam } from "@/lib/copa";
import { getCopaTicker } from "@/lib/copa-data";

// Barra de jogos estilo "Copa" (inspirada no terra.com.br).
// Os jogos vêm da API-Football (se configurada) ou do conjunto estático.

function Flag({ team }: { team: CopaTeam }) {
  return (
    <div className="flex w-14 flex-col items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl(team.flag)}
        alt={team.code}
        className="h-9 w-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
        loading="lazy"
      />
      <span className="text-xs font-bold text-slate-700">{team.code}</span>
    </div>
  );
}

export async function CopaBar() {
  const matches = await getCopaTicker();
  if (matches.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Linha do logo + links */}
        <div className="flex items-center gap-5 py-3">
          <Link href="/" className="shrink-0 text-2xl font-black italic tracking-tight">
            <span className="text-green-600">COPA</span>
            <span className="mx-0.5 text-yellow-400">★</span>
            <span className="text-blue-600">26</span>
          </Link>
          <Link href="/copa/tabela" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:underline sm:flex">
            TABELA DA COPA
            <span className="text-blue-500">›</span>
          </Link>
          <Link href="/copa/onde-ver" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:underline sm:flex">
            ONDE VER
            <span className="text-blue-500">›</span>
          </Link>
          <div className="hidden h-px flex-1 bg-blue-600 sm:block" />
        </div>

        {/* Faixa de jogos */}
        <div className="mb-3 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
          <div className="flex items-stretch overflow-x-auto px-2 py-3">
            {matches.map((m, i) => {
              const finished = typeof m.homeScore === "number" && typeof m.awayScore === "number";
              return (
                <div key={m.id} className="flex items-center">
                  <div className="flex items-center justify-center gap-3 px-6">
                    <Flag team={m.home} />
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm text-slate-400">×</span>
                      {finished ? (
                        <span className="whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-white">
                          {m.homeScore}-{m.awayScore}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          {m.time}
                        </span>
                      )}
                    </div>
                    <Flag team={m.away} />
                  </div>
                  {i < matches.length - 1 && <div className="my-2 w-px self-stretch bg-slate-300" />}
                </div>
              );
            })}
          </div>

          {/* Listra colorida inferior */}
          <div className="flex h-1.5">
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-blue-600" />
            <div className="flex-1 bg-yellow-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
