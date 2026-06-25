"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
      Sair
    </button>
  );
}

export function RunPipelineButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/process", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMsg(`✓ ${data.created} importados, ${data.rewritten} reescritos, ${data.published} publicados.`);
      router.refresh();
    } else {
      setMsg(data.error || "Erro ao processar.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Processando..." : "▶ Executar pipeline agora"}
      </button>
      {msg && <span className="text-sm text-slate-600">{msg}</span>}
    </div>
  );
}

// Reescreve em lote os artigos pendentes e já publica.
export function BatchPublishButton({ pendingCount = 0 }: { pendingCount?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [msg, setMsg] = useState("");

  async function run() {
    setLoading(true);
    setMsg("Reescrevendo e publicando... isso pode levar alguns instantes.");
    const res = await fetch("/api/process/batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ limit }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMsg(`✓ ${data.published} publicados${data.errors ? `, ${data.errors} com erro` : ""}.`);
      router.refresh();
    } else {
      setMsg(data.error || "Erro no processamento em lote.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
        title="Quantos artigos processar"
      >
        {[5, 10, 20, 30, 50].map((n) => (
          <option key={n} value={n}>
            {n} artigos
          </option>
        ))}
      </select>
      <button
        onClick={run}
        disabled={loading || pendingCount === 0}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        title={pendingCount === 0 ? "Não há artigos pendentes" : ""}
      >
        {loading ? "Processando..." : "✨ Reescrever em lote e publicar"}
      </button>
      {msg && <span className="text-sm text-slate-600">{msg}</span>}
    </div>
  );
}

// Botão genérico que chama uma API e atualiza a página
export function ActionButton({
  url,
  method = "POST",
  label,
  loadingLabel,
  className = "",
  confirm,
}: {
  url: string;
  method?: string;
  label: string;
  loadingLabel?: string;
  className?: string;
  confirm?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function go() {
    if (confirm && !window.confirm(confirm)) return;
    setLoading(true);
    const res = await fetch(url, { method });
    setLoading(false);
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Erro na operação.");
    }
  }

  return (
    <button onClick={go} disabled={loading} className={className}>
      {loading ? loadingLabel || "..." : label}
    </button>
  );
}
