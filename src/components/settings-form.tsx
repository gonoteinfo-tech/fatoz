"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSettings } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingFb, setTestingFb] = useState(false);
  const [fbMsg, setFbMsg] = useState("");
  const [msg, setMsg] = useState("");

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
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
    setMsg(res.ok ? "✓ Configurações salvas." : "Erro ao salvar.");
    if (res.ok) router.refresh();
  }

  async function test() {
    setTesting(true);
    setMsg("Testando conexão...");
    const res = await fetch("/api/settings/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setTesting(false);
    setMsg(d.message || (res.ok ? "✓ Conexão OK." : "Falha na conexão."));
  }

  async function testFootball() {
    setTestingFb(true);
    setFbMsg("Testando API-Football...");
    const res = await fetch("/api/settings/test-football", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setTestingFb(false);
    setFbMsg(d.message || (res.ok ? "✓ Conexão OK." : "Falha na conexão."));
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500";
  const card = "rounded-xl border border-slate-200 bg-white p-5";

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="mb-4 font-bold">Provedor de IA</h3>
        <div className="flex flex-wrap gap-2">
          {(["gemini", "claude", "openai"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("aiProvider", p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                form.aiProvider === p ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p === "gemini" ? "Google Gemini" : p === "claude" ? "Claude (Anthropic)" : "OpenAI"}
            </button>
          ))}
        </div>

        {form.aiProvider === "gemini" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Chave da API Gemini</label>
              <input type="password" value={form.geminiApiKey} onChange={(e) => set("geminiApiKey", e.target.value)} className={input} placeholder="AIza..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <input value={form.geminiModel} onChange={(e) => set("geminiModel", e.target.value)} className={input} placeholder="gemini-1.5-flash" />
            </div>
          </div>
        )}
        {form.aiProvider === "claude" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Chave da API Claude</label>
              <input type="password" value={form.claudeApiKey} onChange={(e) => set("claudeApiKey", e.target.value)} className={input} placeholder="sk-ant-..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <input value={form.claudeModel} onChange={(e) => set("claudeModel", e.target.value)} className={input} placeholder="claude-opus-4-8" />
            </div>
          </div>
        )}
        {form.aiProvider === "openai" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Chave da API OpenAI</label>
              <input type="password" value={form.openaiApiKey} onChange={(e) => set("openaiApiKey", e.target.value)} className={input} placeholder="sk-..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <input value={form.openaiModel} onChange={(e) => set("openaiModel", e.target.value)} className={input} placeholder="gpt-4o-mini" />
            </div>
          </div>
        )}

        <button onClick={test} disabled={testing} className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          {testing ? "Testando..." : "Testar conexão"}
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-4 font-bold">Estilo de reescrita</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Idioma</label>
            <input value={form.rewriteLanguage} onChange={(e) => set("rewriteLanguage", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Tom</label>
            <input value={form.rewriteTone} onChange={(e) => set("rewriteTone", e.target.value)} className={input} />
          </div>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">Instruções extras para a IA</label>
        <textarea value={form.rewriteInstructions} onChange={(e) => set("rewriteInstructions", e.target.value)} rows={3} className={input} placeholder="Ex: sempre incluir um subtítulo e uma conclusão." />
      </div>

      <div className={card}>
        <h3 className="mb-4 font-bold">Site</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Nome do site</label>
            <input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <input value={form.siteDescription} onChange={(e) => set("siteDescription", e.target.value)} className={input} />
          </div>
        </div>
      </div>

      <div className={card}>
        <h3 className="mb-1 font-bold">Dados da Copa · API-Football</h3>
        <p className="mb-4 text-sm text-slate-500">
          Cole sua chave da{" "}
          <a href="https://www.api-football.com/" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
            API-Football
          </a>{" "}
          para jogos, placares e classificação ao vivo. Sem chave, o site usa dados de exemplo.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Chave da API-Football</label>
            <input type="password" value={form.apiFootballKey} onChange={(e) => set("apiFootballKey", e.target.value)} className={input} placeholder="sua-chave-api-sports" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">League ID</label>
            <input value={form.copaLeagueId} onChange={(e) => set("copaLeagueId", e.target.value)} className={input} placeholder="1" />
            <p className="mt-1 text-xs text-slate-400">1 = Copa do Mundo</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Temporada (season)</label>
            <input value={form.copaSeason} onChange={(e) => set("copaSeason", e.target.value)} className={input} placeholder="2026" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={testFootball} disabled={testingFb} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {testingFb ? "Testando..." : "Testar API-Football"}
          </button>
          {fbMsg && <span className="text-sm text-slate-600">{fbMsg}</span>}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Integração WordPress (opcional)</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.wpEnabled === "true"} onChange={(e) => set("wpEnabled", e.target.checked ? "true" : "false")} />
            Ativar
          </label>
        </div>
        {form.wpEnabled === "true" && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">URL do site WordPress</label>
              <input value={form.wpUrl} onChange={(e) => set("wpUrl", e.target.value)} className={input} placeholder="https://seusite.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Usuário</label>
              <input value={form.wpUser} onChange={(e) => set("wpUser", e.target.value)} className={input} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Application Password</label>
              <input type="password" value={form.wpAppPassword} onChange={(e) => set("wpAppPassword", e.target.value)} className={input} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
