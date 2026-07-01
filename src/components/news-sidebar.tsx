import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { WeatherWidget } from "./weather-widget";
import { AdSlot } from "./ad-slot";

export async function NewsSidebar({ excludeId }: { excludeId?: string; category?: string }) {
  const [settings, popular] = await Promise.all([
    getSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED", ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      orderBy: { views: "desc" },
      take: 5,
    }),
  ]);

  return (
    <aside className="space-y-6 lg:sticky lg:top-6">
      {/* Widget de tempo interativo (busca de cidade + detalhes) */}
      <WeatherWidget />

      {/* Publicidade — retângulo (300×250) */}
      <AdSlot code={settings.adSidebarTopCode} image={settings.adSidebarTopImage} link={settings.adSidebarTopLink} />

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

      {/* Publicidade — meia página (300×600) */}
      <AdSlot code={settings.adSidebarBottomCode} image={settings.adSidebarBottomImage} link={settings.adSidebarBottomLink} />
    </aside>
  );
}
