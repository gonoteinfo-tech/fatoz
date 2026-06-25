import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { THEME_PRESETS, type ThemeKey } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const theme = THEME_PRESETS[(s.themeColor as ThemeKey)] ?? THEME_PRESETS.orange;
  const icon = s.favicon || "/fatoz-favicon.svg";

  return {
    name: s.siteName,
    short_name: s.siteName,
    description: s.siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: theme.swatch,
    lang: "pt-BR",
    icons: [
      { src: icon, sizes: "any", type: icon.startsWith("data:image/svg") || icon.endsWith(".svg") ? "image/svg+xml" : "image/png", purpose: "any" },
    ],
  };
}
