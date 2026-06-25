import slugify from "slugify";
import { prisma } from "./db";
import { getSettings, type AppSettings } from "./settings";

export async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, locale: "pt" }).slice(0, 80) || "noticia";
  let slug = base;
  let i = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// URL base do site: configuração do painel > variável de ambiente > localhost.
export function baseUrlFrom(settings: Pick<AppSettings, "siteUrl">): string {
  const url = (settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").trim();
  return url.replace(/\/$/, "");
}

export async function getBaseUrl(): Promise<string> {
  const settings = await getSettings();
  return baseUrlFrom(settings);
}

export function absoluteUrl(path: string, base?: string): string {
  const root = (base || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
}

// Conta palavras de um HTML (para wordCount nos dados estruturados).
export function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

// Dados estruturados (JSON-LD) da Organização/veículo de notícias.
export function organizationLd(settings: AppSettings, base: string) {
  const logo = settings.ogImage || (settings.logo && !settings.logo.startsWith("data:") ? settings.logo : `${base}/fatoz-logo.svg`);
  const sameAs = [settings.socialInstagram, settings.socialFacebook, settings.socialTwitter, settings.socialYoutube].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: settings.publisherName || settings.siteName,
    url: base,
    logo: { "@type": "ImageObject", url: logo },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// Dados estruturados do site, com caixa de busca (sitelinks searchbox).
export function websiteLd(settings: AppSettings, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: base,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/busca?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}
