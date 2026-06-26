import Link from "next/link";
import { CategoryIcon } from "./category-icon";
import { MarketWeatherBar } from "./market-weather";
import { getSettings } from "@/lib/settings";

export async function PublicHeader({ siteName, categories }: { siteName: string; categories: string[] }) {
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  const { logo, logoHeight, logoMaxWidth, logoFit, menuLinks } = await getSettings();
  let customLinks: { label: string; url: string }[] = [];
  try {
    const parsed = JSON.parse(menuLinks || "[]");
    if (Array.isArray(parsed)) customLinks = parsed.filter((x) => x?.label && x?.url);
  } catch {
    /* ignora JSON inválido */
  }

  return (
    <header className="relative z-30 bg-white shadow-sm">
      {/* Barra superior (gradiente: cor principal -> secundária) */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-500 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="hidden capitalize sm:inline">{today}</span>
          <div className="flex items-center gap-4">
            <Link href="/feed.xml" className="hover:underline">RSS</Link>
          </div>
        </div>
      </div>

      {/* Cotações + previsão do tempo (dados reais) */}
      <MarketWeatherBar />

      {/* Logo */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={siteName}
                style={{
                  height: `${Number(logoHeight) || 40}px`,
                  maxWidth: `${Number(logoMaxWidth) || 200}px`,
                  objectFit: (logoFit as any) || "contain",
                  width: logoFit === "fill" ? `${Number(logoMaxWidth) || 200}px` : undefined,
                }}
              />
            ) : (
              <>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white shadow-sm">
                  L
                </span>
                <span className="text-2xl font-black tracking-tight text-slate-900">{siteName}</span>
              </>
            )}
          </Link>
        </div>
      </div>

      {/* Navegação por categorias com ícones */}
      {(categories.length > 0 || customLinks.length > 0) && (
        <nav className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-brand-700 hover:bg-brand-50"
            >
              <CategoryIcon category="news" className="h-4 w-4" />
              Início
            </Link>
            {customLinks.map((l) => (
              <Link
                key={l.url + l.label}
                href={l.url}
                className="flex shrink-0 items-center rounded-full px-3 py-1.5 font-semibold text-brand-700 hover:bg-brand-50"
              >
                {l.label}
              </Link>
            ))}
            {categories.map((c) => (
              <Link
                key={c}
                href={`/categoria/${encodeURIComponent(c)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <CategoryIcon category={c} className="h-4 w-4" />
                {c}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export async function PublicFooter({ siteName }: { siteName: string }) {
  const s = await getSettings();
  const socials = [
    { url: s.socialInstagram, label: "Instagram", icon: "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.3.07 1.68.07 4.92s0 3.62-.07 4.9c-.05 1.18-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.3.06-1.68.07-4.9.07s-3.62 0-4.9-.07c-1.18-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.23C2.2 15.6 2.2 15.22 2.2 12s0-3.62.07-4.9c.05-1.18.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.23-.41C8.4 2.2 8.78 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.56a4.16 4.16 0 1 1 0-8.32 4.16 4.16 0 0 1 0 8.32zm6.65-10.8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" },
    { url: s.socialFacebook, label: "Facebook", icon: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" },
    { url: s.socialTwitter, label: "X", icon: "M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.2L1 2h7l4.8 6.4L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" },
    { url: s.socialYoutube, label: "YouTube", icon: "M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.77-1.77C19.34 5.1 12 5.1 12 5.1s-7.34 0-8.83.43A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.77 1.77c1.5.43 8.83.43 8.83.43s7.34 0 8.83-.43a2.5 2.5 0 0 0 1.77-1.77C23 15.2 23 12 23 12zM9.75 15.5v-7l6.25 3.5-6.25 3.5z" },
  ].filter((x) => x.url);

  return (
    <footer className="mt-16 border-t-4 border-brand-600 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              {s.logoDark || s.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoDark || s.logo} alt={siteName} className="h-10 max-w-[200px] object-contain" />
              ) : (
                <>
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-black text-white">L</span>
                  <span className="text-xl font-black text-white">{siteName}</span>
                </>
              )}
            </div>
            {s.siteTagline && <p className="mt-2 text-sm text-slate-400">{s.siteTagline}</p>}
          </div>

          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map((soc) => (
                <a
                  key={soc.label}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={soc.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-brand-600 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d={soc.icon} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 max-w-md text-sm text-slate-400">{s.siteDescription}</p>
        {s.contactEmail && (
          <p className="mt-2 text-sm text-slate-400">
            Contato: <a href={`mailto:${s.contactEmail}`} className="hover:text-white">{s.contactEmail}</a>
          </p>
        )}
        <p className="mt-6 text-xs text-slate-500">
          {s.footerText || `© ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.`}
        </p>
      </div>
    </footer>
  );
}

// Trilha de navegação (breadcrumbs) visual + acessível
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-brand-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// Banner/capa da home (exibido quando configurado em Aparência)
export function HeroBanner({
  image,
  title,
  subtitle,
  link,
}: {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}) {
  if (!image) return null;
  const inner = (
    <div className="relative overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title || "Banner"} className="h-56 w-full object-cover md:h-72" />
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 md:p-8">
          {title && <h2 className="text-2xl font-black text-white drop-shadow md:text-4xl">{title}</h2>}
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">{subtitle}</p>}
        </div>
      )}
    </div>
  );
  return <section className="mb-8">{link ? <Link href={link}>{inner}</Link> : inner}</section>;
}

// Cabeçalho de seção de categoria (ícone + nome + barra laranja + "ver mais")
export function SectionHeader({ category, href }: { category: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-slate-100 pb-2">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <CategoryIcon category={category} className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
          <span className="border-b-4 border-brand-600 pb-1">{category}</span>
        </h2>
      </div>
      <Link href={href} className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
        Ver mais
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export interface CardArticle {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  category: string;
  publishedAt: Date | null;
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function ArticleCard({ a, featured = false }: { a: CardArticle; featured?: boolean }) {
  return (
    <Link
      href={`/noticia/${a.slug}`}
      className={`group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div className={`relative w-full overflow-hidden bg-slate-100 ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        {a.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.imageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading={featured ? "eager" : "lazy"}
            fetchPriority={featured ? "high" : "auto"}
            decoding="async"
            width={featured ? 800 : 400}
            height={featured ? 450 : 250}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">Sem imagem</div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
          <CategoryIcon category={a.category} className="h-3 w-3" />
          {a.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className={`font-bold leading-snug text-slate-900 group-hover:text-brand-700 ${featured ? "text-2xl" : "text-base"}`}>
          {a.title}
        </h3>
        <p className={`mt-2 text-sm text-slate-500 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>{a.excerpt}</p>
        <p className="mt-3 text-xs font-medium text-slate-400">{fmtDate(a.publishedAt)}</p>
      </div>
    </Link>
  );
}

// Item compacto (texto) para listas laterais dentro de uma seção
export function ArticleListItem({ a }: { a: CardArticle }) {
  return (
    <Link href={`/noticia/${a.slug}`} className="group flex gap-3 border-b border-slate-100 pb-3 last:border-0">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {a.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.imageUrl} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 group-hover:text-brand-700">{a.title}</h4>
        <p className="mt-1 text-xs font-medium text-slate-400">{fmtDate(a.publishedAt)}</p>
      </div>
    </Link>
  );
}
