"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/settings";
import { THEME_PRESETS, type ThemeKey } from "@/lib/theme";

const FAVICON_MAX_BYTES = 1024 * 1024; // 1 MB (favicon não precisa ser grande)

interface MenuLink {
  label: string;
  url: string;
}

function parseMenu(json: string): MenuLink[] {
  try {
    const arr = JSON.parse(json || "[]");
    return Array.isArray(arr) ? arr.filter((x) => x && typeof x.label === "string") : [];
  } catch {
    return [];
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function AppearanceForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onImage(key: "logo" | "logoDark" | "favicon" | "heroImage" | "ogImage", file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("Selecione um arquivo de imagem.");
      return;
    }
    // Favicon mantém limite; logo e banner não têm limite de tamanho.
    if (key === "favicon" && file.size > FAVICON_MAX_BYTES) {
      setMsg("Favicon muito grande (máx. 1 MB). Use uma imagem pequena (ex.: 64×64).");
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    set(key, dataUrl);
    setMsg("");
  }

  // ---- Links de menu ----
  const menu = parseMenu(form.menuLinks);
  function setMenu(next: MenuLink[]) {
    set("menuLinks", JSON.stringify(next));
  }
  function addLink() {
    setMenu([...menu, { label: "", url: "" }]);
  }
  function updateLink(i: number, field: keyof MenuLink, value: string) {
    const next = menu.slice();
    next[i] = { ...next[i], [field]: value };
    setMenu(next);
  }
  function removeLink(i: number) {
    setMenu(menu.filter((_, idx) => idx !== i));
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
    if (res.ok) {
      setMsg("✓ Aparência salva. Recarregue o site para ver o favicon atualizado.");
      router.refresh();
    } else {
      setMsg("Erro ao salvar.");
    }
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500";
  const card = "rounded-xl border border-slate-200 bg-white p-5";

  return (
    <div className="space-y-6">
      {/* Cor principal do tema */}
      <div className={card}>
        <h3 className="mb-1 font-bold">Cor principal do tema</h3>
        <p className="mb-4 text-sm text-slate-500">Define a cor de destaque usada em botões, links e detalhes do site.</p>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(THEME_PRESETS) as ThemeKey[]).map((key) => {
            const preset = THEME_PRESETS[key];
            const active = form.themeColor === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => set("themeColor", key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  active ? "border-slate-800 ring-2 ring-slate-800/10" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="h-5 w-5 rounded-full" style={{ background: preset.swatch }} />
                {preset.label}
                {active && <span className="text-slate-400">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logo e favicon */}
      <div className={card}>
        <h3 className="mb-4 font-bold">Logo e favicon</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Logo do site</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {form.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo} alt="logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-2xl font-black text-brand-600">L</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input type="file" accept="image/*" onChange={(e) => onImage("logo", e.target.files?.[0])} className="text-sm" />
                {form.logo && (
                  <button onClick={() => set("logo", "")} className="text-left text-xs text-red-600 hover:underline">
                    Remover logo
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">PNG/SVG transparente, sem limite de tamanho. Aparece no cabeçalho e rodapé.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Favicon</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {form.favicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.favicon} alt="favicon" className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">ícone</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input type="file" accept="image/*" onChange={(e) => onImage("favicon", e.target.files?.[0])} className="text-sm" />
                {form.favicon && (
                  <button onClick={() => set("favicon", "")} className="text-left text-xs text-red-600 hover:underline">
                    Remover favicon
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">Quadrado (ex.: 32×32 ou 64×64), PNG/ICO/SVG.</p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <label className="text-sm font-medium text-slate-700">Logo para fundo escuro (rodapé)</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="grid h-16 w-28 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
              {form.logoDark ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoDark} alt="logo escuro" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs text-slate-400">opcional</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input type="file" accept="image/*" onChange={(e) => onImage("logoDark", e.target.files?.[0])} className="text-sm" />
              {form.logoDark && (
                <button onClick={() => set("logoDark", "")} className="text-left text-xs text-red-600 hover:underline">
                  Remover
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Versão com texto claro, usada no rodapé escuro. Se vazio, usa o logo normal.</p>
        </div>
      </div>

      {/* Tamanho e proporção do logo */}
      <div className={card}>
        <h3 className="mb-1 font-bold">Tamanho e proporção do logo</h3>
        <p className="mb-4 text-sm text-slate-500">Ajuste como o logo aparece no cabeçalho do site.</p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700">
                Altura <span className="text-slate-400">{form.logoHeight}px</span>
              </label>
              <input
                type="range"
                min={20}
                max={160}
                step={2}
                value={Number(form.logoHeight) || 40}
                onChange={(e) => set("logoHeight", e.target.value)}
                className="mt-2 w-full accent-brand-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-700">
                Largura máxima <span className="text-slate-400">{form.logoMaxWidth}px</span>
              </label>
              <input
                type="range"
                min={60}
                max={600}
                step={10}
                value={Number(form.logoMaxWidth) || 200}
                onChange={(e) => set("logoMaxWidth", e.target.value)}
                className="mt-2 w-full accent-brand-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Proporção (ajuste da imagem)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { v: "contain", l: "Manter proporção" },
                  { v: "fill", l: "Esticar" },
                  { v: "cover", l: "Preencher (corta)" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => set("logoFit", o.v)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      form.logoFit === o.v ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pré-visualização ao vivo */}
          <div>
            <span className="text-sm font-medium text-slate-700">Pré-visualização</span>
            <div className="mt-2 flex items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              {form.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logo}
                  alt="prévia do logo"
                  style={{
                    height: `${Number(form.logoHeight) || 40}px`,
                    maxWidth: `${Number(form.logoMaxWidth) || 200}px`,
                    objectFit: (form.logoFit as any) || "contain",
                    width: form.logoFit === "fill" ? `${Number(form.logoMaxWidth) || 200}px` : undefined,
                  }}
                />
              ) : (
                <span className="text-sm text-slate-400">Envie um logo acima para ver a prévia.</span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">A barra branca simula o cabeçalho do site.</p>
          </div>
        </div>
      </div>

      {/* Banner / capa da home */}
      <div className={card}>
        <h3 className="mb-1 font-bold">Banner / capa da home</h3>
        <p className="mb-4 text-sm text-slate-500">Imagem de destaque exibida no topo da página inicial (opcional).</p>
        <div className="flex flex-wrap items-center gap-4">
          <input type="file" accept="image/*" onChange={(e) => onImage("heroImage", e.target.files?.[0])} className="text-sm" />
          {form.heroImage && (
            <button onClick={() => set("heroImage", "")} className="text-xs text-red-600 hover:underline">
              Remover banner
            </button>
          )}
        </div>
        {form.heroImage && (
          <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.heroImage} alt="banner" className="h-40 w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-lg font-black text-white">{form.heroTitle || "Título do banner"}</p>
              <p className="text-sm text-white/80">{form.heroSubtitle || "Subtítulo do banner"}</p>
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Título do banner</label>
            <input value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Subtítulo</label>
            <input value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} className={input} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Link do banner (opcional)</label>
            <input value={form.heroLink} onChange={(e) => set("heroLink", e.target.value)} className={input} placeholder="/categoria/Esportes ou https://..." />
          </div>
        </div>
      </div>

      {/* Links de menu personalizados */}
      <div className={card}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold">Links de menu (topo)</h3>
          <button onClick={addLink} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
            + Adicionar link
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">Links extras exibidos na barra de navegação, antes das categorias.</p>
        {menu.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum link personalizado. Clique em “Adicionar link”.</p>
        ) : (
          <div className="space-y-2">
            {menu.map((link, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Rótulo (ex.: Contato)"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="URL (ex.: /sobre ou https://...)"
                  className="flex-[2] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
                <button onClick={() => removeLink(i)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Identidade */}
      <div className={card}>
        <h3 className="mb-4 font-bold">Identidade</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Nome do site</label>
            <input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Slogan</label>
            <input value={form.siteTagline} onChange={(e) => set("siteTagline", e.target.value)} className={input} placeholder="Sua fonte de notícias" />
          </div>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">Descrição (SEO)</label>
        <textarea value={form.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} rows={2} className={input} />
        <label className="mt-3 block text-sm font-medium text-slate-700">Texto do rodapé</label>
        <input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} className={input} placeholder="© Sua Empresa. Todos os direitos reservados." />
      </div>

      {/* SEO */}
      <div className={card}>
        <h3 className="mb-1 font-bold">SEO e compartilhamento</h3>
        <p className="mb-4 text-sm text-slate-500">Configurações para buscadores (Google) e redes sociais.</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">URL do site</label>
            <input value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} className={input} placeholder="https://fatoz.com.br" />
            <p className="mt-1 text-xs text-slate-400">Usada em links canônicos, sitemap e dados estruturados.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nome do veículo (publisher)</label>
            <input value={form.publisherName} onChange={(e) => set("publisherName", e.target.value)} className={input} placeholder="fatoz" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Perfil no X (Twitter)</label>
            <input value={form.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} className={input} placeholder="@fatoz" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Código do Google Search Console</label>
            <input value={form.googleVerification} onChange={(e) => set("googleVerification", e.target.value)} className={input} placeholder="conteúdo da meta google-site-verification" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700">Imagem de compartilhamento (Open Graph)</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-36 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {form.ogImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.ogImage} alt="og" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">1200×630</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input type="file" accept="image/*" onChange={(e) => onImage("ogImage", e.target.files?.[0])} className="text-sm" />
              {form.ogImage && (
                <button onClick={() => set("ogImage", "")} className="text-left text-xs text-red-600 hover:underline">
                  Remover
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">Recomendado 1200×630px. Aparece ao compartilhar o site no WhatsApp, Facebook e X.</p>
        </div>
      </div>

      {/* Contato e redes sociais */}
      <div className={card}>
        <h3 className="mb-4 font-bold">Contato e redes sociais</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">E-mail de contato</label>
            <input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={input} placeholder="contato@seusite.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Instagram</label>
            <input value={form.socialInstagram} onChange={(e) => set("socialInstagram", e.target.value)} className={input} placeholder="https://instagram.com/seuperfil" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Facebook</label>
            <input value={form.socialFacebook} onChange={(e) => set("socialFacebook", e.target.value)} className={input} placeholder="https://facebook.com/suapagina" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">X (Twitter)</label>
            <input value={form.socialTwitter} onChange={(e) => set("socialTwitter", e.target.value)} className={input} placeholder="https://x.com/seuperfil" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">YouTube</label>
            <input value={form.socialYoutube} onChange={(e) => set("socialYoutube", e.target.value)} className={input} placeholder="https://youtube.com/@seucanal" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar aparência"}
        </button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
