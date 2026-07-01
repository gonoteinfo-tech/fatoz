import { getSettings } from "@/lib/settings";
import { AdsForm } from "@/components/ads-form";

export const dynamic = "force-dynamic";

export default async function PublicidadePage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">Publicidade</h1>
      <p className="mb-6 text-slate-500">Gerencie os espaços de anúncio do site — código ou imagem.</p>
      <AdsForm initial={settings} />
    </div>
  );
}
