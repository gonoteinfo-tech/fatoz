import { prisma } from "./db";

export type AiProvider = "claude" | "gemini" | "openai";

export interface AppSettings {
  // Provedor de IA ativo
  aiProvider: AiProvider;
  claudeApiKey: string;
  claudeModel: string;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;

  // Estilo de reescrita
  rewriteLanguage: string;
  rewriteTone: string;
  rewriteInstructions: string;

  // Site / aparência
  siteName: string;
  siteDescription: string;
  siteTagline: string;
  themeColor: string; // preset de cor (orange, blue, green, ...)
  heroImage: string; // banner/capa da home (data URL ou URL)
  heroTitle: string;
  heroSubtitle: string;
  heroLink: string;
  menuLinks: string; // JSON: [{ label, url }]
  logo: string; // data URL ou URL da imagem
  logoDark: string; // versão para fundo escuro (rodapé)
  logoHeight: string; // altura do logo no cabeçalho (px)
  logoMaxWidth: string; // largura máxima (px)
  logoFit: string; // contain | fill | cover (proporção)
  favicon: string; // data URL ou URL
  footerText: string;
  contactEmail: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
  socialYoutube: string;

  // WordPress (opcional)
  wpEnabled: string;
  wpUrl: string;
  wpUser: string;
  wpAppPassword: string;

  // API-Football (dados da Copa: jogos, placares e classificação)
  apiFootballKey: string;
  copaLeagueId: string;
  copaSeason: string;

  // SEO
  siteUrl: string; // ex.: https://fatoz.com.br
  ogImage: string; // imagem padrão de compartilhamento (data URL ou URL)
  twitterHandle: string; // ex.: @fatoz
  googleVerification: string; // código do Google Search Console
  publisherName: string; // nome do veículo (publisher) nos dados estruturados
}

const DEFAULTS: AppSettings = {
  siteUrl: "",
  ogImage: "",
  twitterHandle: "",
  googleVerification: "",
  publisherName: "",
  aiProvider: "gemini",
  claudeApiKey: "",
  claudeModel: "claude-opus-4-8",
  geminiApiKey: "",
  geminiModel: "gemini-1.5-flash",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  rewriteLanguage: "Português (Brasil)",
  rewriteTone: "jornalístico, profissional e imparcial",
  rewriteInstructions: "",
  siteName: "LabNews",
  siteDescription: "Notícias automáticas, originais e otimizadas para SEO.",
  siteTagline: "",
  themeColor: "orange",
  heroImage: "",
  heroTitle: "",
  heroSubtitle: "",
  heroLink: "",
  menuLinks: "[]",
  logo: "",
  logoDark: "",
  logoHeight: "40",
  logoMaxWidth: "200",
  logoFit: "contain",
  favicon: "",
  footerText: "",
  contactEmail: "",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
  socialYoutube: "",
  wpEnabled: "false",
  wpUrl: "",
  wpUser: "",
  wpAppPassword: "",
  apiFootballKey: "",
  copaLeagueId: "1", // 1 = Copa do Mundo na API-Football
  copaSeason: "2026",
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return { ...DEFAULTS, ...(map as Partial<AppSettings>) } as AppSettings;
  } catch (e) {
    // Banco indisponível (ex.: tabelas ainda não criadas). Usa os padrões para
    // não derrubar o layout. Rode "npm run build" (faz prisma db push) no servidor.
    console.error("[settings] falha ao ler configurações, usando padrões:", (e as Error).message);
    return { ...DEFAULTS };
  }
}

export async function saveSettings(values: Partial<AppSettings>): Promise<void> {
  const entries = Object.entries(values).filter(([, v]) => v !== undefined);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
}

// Mascara chaves de API para exibição no painel
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "••••••";
  return value.slice(0, 4) + "••••••••" + value.slice(-4);
}
