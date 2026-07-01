import Link from "next/link";
import { prisma } from "@/lib/db";
import { WeatherWidget } from "./weather-widget";

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

export async function NewsSidebar({ excludeId }: { excludeId?: string; category?: string }) {
  const popular = await prisma.article.findMany({
    where: { status: "PUBLISHED", ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    orderBy: { views: "desc" },
    take: 5,
  });

  return (
    <aside className="space-y-6 lg:sticky lg:top-6">
      {/* Widget de tempo interativo (busca de cidade + detalhes) */}
      <WeatherWidget />

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
