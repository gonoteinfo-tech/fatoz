import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Configurações</h1>
      <SettingsForm initial={settings} />

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-2 font-bold">Automação (cron)</h3>
        <p className="text-sm text-slate-600">
          Para executar o pipeline automaticamente, agende uma chamada GET para o endpoint abaixo (ex: Vercel Cron,
          cron-job.org, GitHub Actions). Recomendado a cada 15–60 minutos.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
          {`GET ${base}/api/cron?secret=SEU_CRON_SECRET`}
        </pre>
      </div>
    </div>
  );
}
