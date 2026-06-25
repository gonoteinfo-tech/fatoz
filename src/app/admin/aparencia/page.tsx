import { getSettings } from "@/lib/settings";
import { AppearanceForm } from "@/components/appearance-form";

export const dynamic = "force-dynamic";

export default async function AparenciaPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Aparência</h1>
      <p className="mb-6 text-slate-500">Logo, favicon e identidade visual do site.</p>
      <AppearanceForm initial={settings} />
    </div>
  );
}
