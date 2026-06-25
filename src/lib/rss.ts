import Parser from "rss-parser";

const parser: Parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; fatozbot/1.0; +https://fatoz.com.br)" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["media:group", "mediaGroup"],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
      ["image", "imageTag"],
      ["itunes:image", "itunesImage"],
    ],
  },
});

export interface FeedItem {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  imageUrl?: string;
  publishedAt?: Date;
}

export interface ParsedFeed {
  title: string;
  description: string;
  items: FeedItem[];
}

function imgFromHtml(html: string): string | undefined {
  if (!html) return undefined;
  // tenta src e também data-src (lazy-load)
  const m =
    html.match(/<img[^>]+(?:data-src|src)=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i) ||
    html.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

function firstImage(item: any): string | undefined {
  // enclosure
  if (item.enclosure?.url && /image|jpg|jpeg|png|webp/i.test(item.enclosure?.type || item.enclosure.url)) {
    return item.enclosure.url;
  }
  // media:thumbnail
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  // media:content (array)
  if (Array.isArray(item.mediaContent)) {
    const img = item.mediaContent.find((m: any) => /image/i.test(m?.$?.medium || m?.$?.type || ""));
    if (img?.$?.url) return img.$.url;
    if (item.mediaContent[0]?.$?.url) return item.mediaContent[0].$.url;
  } else if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  // media:group > media:content / media:thumbnail
  const group = item.mediaGroup;
  if (group) {
    const gc = group["media:content"];
    if (Array.isArray(gc) && gc[0]?.$?.url) return gc[0].$.url;
    if (gc?.$?.url) return gc.$.url;
    const gt = group["media:thumbnail"];
    if (Array.isArray(gt) && gt[0]?.$?.url) return gt[0].$.url;
    if (gt?.$?.url) return gt.$.url;
  }
  // itunes:image / <image>
  if (item.itunesImage?.$?.href) return item.itunesImage.$.href;
  if (typeof item.imageTag === "string" && /^https?:\/\//.test(item.imageTag)) return item.imageTag;
  if (item.imageTag?.url) return item.imageTag.url;
  // imagem dentro do HTML (content / description)
  return (
    imgFromHtml(item.contentEncoded || "") ||
    imgFromHtml(item.content || "") ||
    imgFromHtml(item.summary || "") ||
    imgFromHtml(item.description || "")
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Busca a imagem de destaque (og:image / twitter:image) direto na página da notícia.
// Usado como fallback quando o RSS não traz imagem.
export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; fatozbot/1.0; +https://fatoz.com.br)" },
    });
    clearTimeout(timer);
    if (!res.ok) return undefined;
    const html = (await res.text()).slice(0, 200000); // só o início (head) basta
    const patterns = [
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function fetchFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url);
  const items: FeedItem[] = (feed.items || []).map((item: any) => {
    const rawContent = item.contentEncoded || item.content || item.summary || item.contentSnippet || "";
    return {
      title: (item.title || "Sem título").trim(),
      link: (item.link || item.guid || "").trim(),
      content: stripHtml(rawContent),
      contentSnippet: (item.contentSnippet || stripHtml(rawContent)).slice(0, 300),
      imageUrl: firstImage(item),
      publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : undefined,
    };
  });
  return {
    title: feed.title || url,
    description: feed.description || "",
    items,
  };
}
