import Link from "next/link";
import { prisma } from "@/lib/db";
import { getWeather, type WeatherKind } from "@/lib/weather";
import { getSettings } from "@/lib/settings";

// Ícone de clima animado (CSS em globals.css: wx-*)
function WeatherIcon({ kind }: { kind: WeatherKind }) {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true">
      {kind === "sun" && (
        <g className="wx-sun" fill="#fde68a" stroke="#fbbf24" strokeWidth="2">
          <circle cx="32" cy="32" r="11" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={32 + Math.cos(a) * 16}
                y1={32 + Math.sin(a) * 16}
                x2={32 + Math.cos(a) * 22}
                y2={32 + Math.sin(a) * 22}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}
      {kind !== "sun" && (
        <>
          <g className="wx-cloud">
            <path
              d="M20 40a10 10 0 010-20 12 12 0 0123-3 9 9 0 011 18z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
          </g>
          {(kind === "rain" || kind === "storm") && (
            <g stroke="#60a5fa" strokeWidth="3" strokeLinecap="round">
              <line className="wx-drop" x1="26" y1="44" x2="26" y2="50" />
              <line className="wx-drop" x1="34" y1="44" x2="34" y2="50" />
              <line className="wx-drop" x1="42" y1="44" x2="42" y2="50" />
            </g>
          )}
          {kind === "storm" && (
            <polygon className="wx-bolt" points="33,42 27,52 32,52 29,60 39,48 33,48" fill="#facc15" />
          )}
          {kind === "snow" && (
            <g fill="#bae6fd">
              <circle className="wx-bolt" cx="26" cy="48" r="2.5" />
              <circle className="wx-bolt" cx="34" cy="50" r="2.5" />
              <circle className="wx-bolt" cx="42" cy="48" r="2.5" />
            </g>
          )}
          {kind === "fog" && (
            <g stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round">
              <line className="wx-bolt" x1="22" y1="46" x2="44" y2="46" />
              <line className="wx-bolt" x1="24" y1="52" x2="42" y2="52" />
            </g>
          )}
        </>
      )}
    </svg>
  );
}

function AdSlot({ label, height = "h-64" }: { label: string; height?: string }) {
  return (
    <div className={`grid ${height} place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center`}>
      <div className="text-slate-400">
        <p className="text-[10px] font-bold uppercase tracking-widest">Publicidade</p>
        <p className="mt-1 text-xs">{label}</p>
      </div>
    </div>
  );
}

export async function NewsSidebar({ excludeId, category }: { excludeId?: string; category?: string }) {
  const [weather, settings, popular] = await Promise.all([
    getWeather(),
    getSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED", ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      orderBy: { views: "desc" },
      take: 5,
    }),
  ]);

  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Clima animado */}
      {weather && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between bg-gradient-to-br from-brand-600 to-accent-500 p-4 text-white">
            <div>
              <p className="text-sm font-semibold opacity-90">{weather.city}</p>
              <p className="text-4xl font-black leading-none">{weather.current}°</p>
              <p className="mt-1 text-xs font-medium opacity-90">{weather.label}</p>
            </div>
            <WeatherIcon kind={weather.kind} />
          </div>
          <div className="flex divide-x divide-slate-100 text-center text-sm">
            <div className="flex-1 py-2">
              <span className="block text-xs text-slate-400">Máx</span>
              <span className="font-bold text-red-600">{weather.max}°</span>
            </div>
            <div className="flex-1 py-2">
              <span className="block text-xs text-slate-400">Mín</span>
              <span className="font-bold text-blue-600">{weather.min}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Anúncio (retângulo médio) */}
      <AdSlot label="300×250" />

      {/* Mais lidas */}
      {popular.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
            <span className="border-b-2 border-accent-500 pb-0.5">Mais lidas</span>
          </h3>
          <ol className="space-y-3">
            {popular.map((a, i) => (
              <li key={a.id} className="flex gap-3">
                <span className="text-lg font-black text-accent-500">{i + 1}</span>
                <Link href={`/noticia/${a.slug}`} className="line-clamp-2 text-sm font-semibold text-slate-700 hover:text-brand-700">
                  {a.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Anúncio (meia página / sticky) */}
      <AdSlot label="300×600" height="h-96" />
    </aside>
  );
}
