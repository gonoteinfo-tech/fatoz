import Parser from "rss-parser";

const parser: Parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "LabNews/1.0 (+https://labnews.local)" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
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

function firstImage(item: any): string | undefined {
  if (item.enclosure?.url && /image/i.test(item.enclosure?.type || "image")) return item.enclosure.url;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (Array.isArray(item.mediaContent)) {
    const img = item.mediaContent.find((m: any) => /image/i.test(m?.$?.medium || m?.$?.type || ""));
    if (img?.$?.url) return img.$.url;
    if (item.mediaContent[0]?.$?.url) return item.mediaContent[0].$.url;
  }
  const html = item.contentEncoded || item.content || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
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
