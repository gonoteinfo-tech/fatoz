import { prisma } from "@/lib/db";
import { AddFeedForm } from "@/components/feeds-ui";
import { ActionButton } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function FeedsPage() {
  const feeds = await prisma.feed.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Feeds RSS</h1>

      <AddFeedForm />

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Feed</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Artigos</th>
              <th className="px-4 py-3 font-medium">Auto</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {feeds.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nenhum feed cadastrado. Adicione um acima.
                </td>
              </tr>
            ) : (
              feeds.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{f.title}</p>
                    <p className="max-w-xs truncate text-xs text-slate-400">{f.url}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.category}</td>
                  <td className="px-4 py-3 text-slate-600">{f._count.articles}</td>
                  <td className="px-4 py-3">{f.autoPublish ? "✅" : "—"}</td>
                  <td className="px-4 py-3">
                    {f.active ? (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Ativo</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Pausado</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        url={`/api/feeds/${f.id}/import`}
                        label="Importar"
                        loadingLabel="..."
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      />
                      <ActionButton
                        url={`/api/feeds/${f.id}/toggle`}
                        label={f.active ? "Pausar" : "Ativar"}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      />
                      <ActionButton
                        url={`/api/feeds/${f.id}`}
                        method="DELETE"
                        label="Excluir"
                        confirm="Excluir este feed? Os artigos serão mantidos."
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
