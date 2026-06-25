import { prisma } from "@/lib/db";
import { ActionButton, BatchPublishButton } from "@/components/admin-ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUSES = [
  { key: "ALL", label: "Todos" },
  { key: "PENDING", label: "Pendentes" },
  { key: "DRAFT", label: "Rascunhos" },
  { key: "PUBLISHED", label: "Publicados" },
  { key: "ERROR", label: "Erros" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700",
  REWRITING: "bg-purple-50 text-purple-700",
  DRAFT: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-green-50 text-green-700",
  ERROR: "bg-red-50 text-red-700",
};

export default async function ArticlesPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status || "ALL";
  const where = status === "ALL" ? {} : { status };
  const [articles, pendingCount] = await Promise.all([
    prisma.article.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.article.count({ where: { status: { in: ["PENDING", "ERROR"] } } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">
          Artigos
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
              {pendingCount} pendentes
            </span>
          )}
        </h1>
        <BatchPublishButton pendingCount={pendingCount} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={`/admin/artigos?status=${s.key}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === s.key ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            Nenhum artigo aqui.
          </div>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[a.status] || "bg-slate-100"}`}>
                      {a.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{a.category}</span>
                    {a.aiProvider && <span className="text-xs text-slate-400">via {a.aiProvider}</span>}
                  </div>
                  <h3 className="font-semibold text-slate-800">{a.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{a.excerpt}</p>
                  {a.errorMessage && <p className="mt-1 text-xs text-red-500">{a.errorMessage}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(a.status === "PENDING" || a.status === "ERROR") && (
                    <ActionButton
                      url={`/api/articles/${a.id}/rewrite`}
                      label="✨ Reescrever"
                      loadingLabel="Reescrevendo..."
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    />
                  )}
                  {a.status === "DRAFT" && (
                    <ActionButton
                      url={`/api/articles/${a.id}/publish`}
                      label="Publicar"
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    />
                  )}
                  {a.status === "PUBLISHED" && (
                    <ActionButton
                      url={`/api/articles/${a.id}/unpublish`}
                      label="Despublicar"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    />
                  )}
                  {a.status !== "PENDING" && (
                    <Link
                      href={`/admin/artigos/${a.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Editar
                    </Link>
                  )}
                  <ActionButton
                    url={`/api/articles/${a.id}`}
                    method="DELETE"
                    label="Excluir"
                    confirm="Excluir este artigo permanentemente?"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
