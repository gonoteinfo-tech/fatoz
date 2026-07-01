"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/settings";

type Keys = keyof AppSettings;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function AdsForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set(key: Keys, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onImage(key: Keys, file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Selecione um arquivo de imagem.");
      return;
    }
    set(key, await readAsDataUrl(file));
    setMsg("");
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMsg(res.ok ? "✓ Publicidade salva." : "Erro ao salvar.");
    if (res.ok) router.refresh();
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";

  function Slot({
    title,
    desc,
    codeKey,
    imageKey,
    linkKey,
  }: {
    title: string;
    desc: string;
    codeKey: Keys;
    imageKey: Keys;
    linkKey: Keys;
  }) {
    const code = form[codeKey] as string;
    const image = form[imageKey] as string;
    const link = form[linkKey] as string;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold">{title}</h3>
        <p className="mb-4 text-sm text-slate-500">{desc}</p>

        <label className="text-sm font-medium text-slate-700">Código do anúncio (HTML/JS)</label>
        <textarea
          value={code}
          onChange={(e) => set(codeKey, e.target.value)}
          rows={4}
          className={`${input} font-mono text-xs`}
          placeholder="Cole aqui o código do AdSense ou de outra rede..."
        />
        <p className="mt-1 text-xs text-slate-400">O código tem prioridade sobre a imagem. Deixe vazio para usar imagem.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Imagem (alternativa ao código)</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-16 w-24 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="anúncio" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">sem imagem</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input type="file" accept="image/*" onChange={(e) => onImage(imageKey, e.target.files?.[0])} className="text-sm" />
                {image && (
                  <button onClick={() => set(imageKey, "")} className="text-left text-xs text-red-600 hover:underline">
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Link (ao clicar na imagem)</label>
            <input value={link} onChange={(e) => set(linkKey, e.target.value)} className={input} placeholder="https://anunciante.com" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Cole o <strong>código</strong> do anúncio (AdSense, etc.) ou envie uma <strong>imagem com link</strong>. Se ambos
        forem preenchidos, o código é usado. Slots vazios não aparecem no site.
      </div>

      <Slot
        title="Banner do topo (1000×200)"
        desc="Exibido no cabeçalho, em todas as páginas."
        codeKey="headerBannerCode"
        imageKey="headerBannerImage"
        linkKey="headerBannerLink"
      />
      <Slot
        title="Sidebar — retângulo (300×250)"
        desc="Coluna lateral das notícias, no topo."
        codeKey="adSidebarTopCode"
        imageKey="adSidebarTopImage"
        linkKey="adSidebarTopLink"
      />
      <Slot
        title="Sidebar — meia página (300×600)"
        desc="Coluna lateral das notícias, embaixo."
        codeKey="adSidebarBottomCode"
        imageKey="adSidebarBottomImage"
        linkKey="adSidebarBottomLink"
      />
      <Slot
        title="Dentro da matéria"
        desc="Exibido após o texto de cada notícia."
        codeKey="adArticleCode"
        imageKey="adArticleImage"
        linkKey="adArticleLink"
      />

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar publicidade"}
        </button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
