import { prisma } from "@/lib/db";
import { RunPipelineButton, BatchPublishButton } from "@/components/admin-ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

export default async function Dashboard() {
  const [feeds, total, published, drafts, pending, errors, views, topArticles, recentLogs] = await Promise.all([
    prisma.feed.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.article.count({ where: { status: "ERROR" } }),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.findMany({ where: { status: "PUBLISHED" }, orderBy: { views: "desc" }, take: 5 }),
    prisma.runLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
          <RunPipelineButton />
          <BatchPublishButton pendingCount={pending} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Feeds" value={feeds} color="text-slate-900" />
        <Stat label="Publicados" value={published} color="text-green-600" />
        <Stat label="Rascunhos" value={drafts} color="text-amber-600" />
        <Stat label="Pendentes" value={pending} color="text-brand-600" />
        <Stat label="Total de artigos" value={total} color="text-slate-900" />
        <Stat label="Erros" value={errors} color="text-red-600" />
        <Stat label="Visualizações" value={views._sum.views ?? 0} color="text-slate-900" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-bold">Mais lidas</h2>
          {topArticles.length === 0 ? (
            <p className="text-sm text-slate-500">Sem dados ainda.</p>
          ) : (
            <ul className="space-y-2">
              {topArticles.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/noticia/${a.slug}`} className="line-clamp-1 text-slate-700 hover:text-brand-600">
                    {a.title}
                  </Link>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{a.views} 👁</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-bold">Últimas execuções</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma execução registrada.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentLogs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 text-slate-600">
                  <span>
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(l.createdAt)}
                  </span>
                  <span className="text-xs">
                    +{l.created} import · {l.rewritten} reescritos · {l.published} pub
                    {l.errors > 0 && <span className="text-red-500"> · {l.errors} erros</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
