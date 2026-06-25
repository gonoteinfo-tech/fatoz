import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { themeCss } from "@/lib/theme";
import { baseUrlFrom, organizationLd, websiteLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = baseUrlFrom(s);
  const title = `${s.siteName} — ${s.siteTagline || "Notícias atualizadas"}`;
  const ogImages = s.ogImage ? [{ url: s.ogImage, width: 1200, height: 630, alt: s.siteName }] : [];

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${s.siteName}` },
    description: s.siteDescription,
    applicationName: s.siteName,
    authors: [{ name: s.publisherName || s.siteName }],
    publisher: s.publisherName || s.siteName,
    alternates: { canonical: "/", types: { "application/rss+xml": `${base}/feed.xml` } },
    icons: s.favicon
      ? { icon: s.favicon, shortcut: s.favicon, apple: s.favicon }
      : { icon: "/fatoz-favicon.svg", apple: "/fatoz-favicon.svg" },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: s.siteName,
      title,
      description: s.siteDescription,
      url: base,
      locale: "pt_BR",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: s.siteDescription,
      site: s.twitterHandle || undefined,
      creator: s.twitterHandle || undefined,
      images: s.ogImage ? [s.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: s.googleVerification ? { google: s.googleVerification } : undefined,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const base = baseUrlFrom(s);

  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {s.favicon && <link rel="icon" href={s.favicon} />}
        <style dangerouslySetInnerHTML={{ __html: themeCss(s.themeColor) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd(s, base)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd(s, base)) }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
