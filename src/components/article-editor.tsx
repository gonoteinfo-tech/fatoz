"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface EditableArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  status: string;
}

export function ArticleEditor({ article }: { article: EditableArticle }) {
  const router = useRouter();
  const [form, setForm] = useState(article);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set<K extends keyof EditableArticle>(key: K, value: EditableArticle[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(publish?: boolean) {
    setSaving(true);
    setMsg("");
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, status: publish ? "PUBLISHED" : form.status }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("✓ Salvo com sucesso.");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error || "Erro ao salvar.");
    }
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="text-sm font-medium text-slate-700">Título</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={input} />

          <label className="mt-4 block text-sm font-medium text-slate-700">Resumo</label>
          <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className={input} />

          <label className="mt-4 block text-sm font-medium text-slate-700">Conteúdo (HTML)</label>
          <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={18} className={`${input} font-mono text-sm`} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-bold">SEO</h3>
          <label className="text-sm font-medium text-slate-700">Meta título</label>
          <input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={input} maxLength={70} />
          <p className="mt-1 text-xs text-slate-400">{form.metaTitle.length}/70</p>

          <label className="mt-3 block text-sm font-medium text-slate-700">Meta descrição</label>
          <textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} rows={2} className={input} maxLength={170} />
          <p className="mt-1 text-xs text-slate-400">{form.metaDescription.length}/170</p>

          <label className="mt-3 block text-sm font-medium text-slate-700">Palavras-chave</label>
          <input value={form.keywords} onChange={(e) => set("keywords", e.target.value)} className={input} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-bold">Publicação</h3>
          <p className="text-sm text-slate-500">
            Status atual: <span className="font-medium text-slate-800">{form.status}</span>
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button onClick={() => save(false)} disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button onClick={() => save(true)} disabled={saving} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
              Salvar e publicar
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-bold">Detalhes</h3>
          <label className="text-sm font-medium text-slate-700">Categoria</label>
          <input value={form.category} onChange={(e) => set("category", e.target.value)} className={input} />

          <label className="mt-3 block text-sm font-medium text-slate-700">Tags (vírgula)</label>
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={input} />

          <label className="mt-3 block text-sm font-medium text-slate-700">URL da imagem</label>
          <input value={form.imageUrl || ""} onChange={(e) => set("imageUrl", e.target.value)} className={input} />

          <label className="mt-3 block text-sm font-medium text-slate-700">Slug</label>
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={input} />
        </div>
      </div>
    </div>
  );
}
