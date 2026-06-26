import { prisma } from "./db";
import { fetchFeed, fetchOgImage } from "./rss";
import { rewriteArticle, generateExtras } from "./ai";
import { getSettings } from "./settings";
import { uniqueSlug } from "./seo";
import { publishToWordPress } from "./wordpress";
import { pingIndexNow } from "./indexnow";

interface PipelineResult {
  found: number;
  created: number;
  rewritten: number;
  published: number;
  errors: number;
  message: string;
}

const MAX_PER_RUN = 5; // limita reescritas por execução para controlar custo/tempo
const MAX_ITEMS_PER_FEED = 15; // importa apenas os 15 itens mais recentes de cada feed

// Importa itens novos de um feed (sem reescrever ainda)
export async function importFeed(feedId: string): Promise<number> {
  const feed = await prisma.feed.findUnique({ where: { id: feedId } });
  if (!feed || !feed.active) return 0;

  const parsed = await fetchFeed(feed.url);
  let created = 0;

  // Importa apenas os 15 itens mais recentes de cada feed (já vêm do mais novo ao mais antigo).
  const recentItems = parsed.items.slice(0, MAX_ITEMS_PER_FEED);

  for (const item of recentItems) {
    if (!item.link) continue;
    const exists = await prisma.article.findUnique({ where: { sourceUrl: item.link } });
    if (exists) continue;

    // Imagem: usa a do RSS; se faltar, busca o og:image da página original.
    let imageUrl = item.imageUrl;
    if (!imageUrl) imageUrl = await fetchOgImage(item.link);

    await prisma.article.create({
      data: {
        feedId: feed.id,
        sourceUrl: item.link,
        sourceTitle: item.title,
        sourceContent: item.content,
        title: item.title,
        slug: await uniqueSlug(item.title),
        excerpt: item.contentSnippet,
        imageUrl,
        category: feed.category,
        status: "PENDING",
        publishedAt: item.publishedAt ?? null,
      },
    });
    created++;
  }

  await prisma.feed.update({ where: { id: feed.id }, data: { lastFetched: new Date() } });
  return created;
}

// Regenera TL;DR (keyPoints) e FAQ para notícias publicadas que ainda não têm.
export async function backfillTldrFaq(limit = 20): Promise<{ checked: number; fixed: number; errors: number }> {
  const settings = await getSettings();
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      content: { not: "" },
      OR: [{ keyPoints: { in: ["", "[]"] } }, { faq: { in: ["", "[]"] } }],
    },
    orderBy: { publishedAt: "desc" },
    take: Math.min(Math.max(1, limit), 50),
    select: { id: true, title: true, content: true },
  });

  let fixed = 0;
  let errors = 0;
  for (const a of articles) {
    try {
      const extras = await generateExtras({ title: a.title, content: a.content }, settings);
      if (extras.keyPoints.length || extras.faq.length) {
        await prisma.article.update({
          where: { id: a.id },
          data: { keyPoints: JSON.stringify(extras.keyPoints), faq: JSON.stringify(extras.faq) },
        });
        fixed++;
      }
    } catch {
      errors++;
    }
  }
  return { checked: articles.length, fixed, errors };
}

// Preenche imagens que faltam em artigos já existentes (busca og:image da fonte).
export async function backfillImages(limit = 30): Promise<{ checked: number; fixed: number }> {
  const articles = await prisma.article.findMany({
    where: { imageUrl: null, sourceUrl: { not: null } },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(1, limit), 100),
    select: { id: true, sourceUrl: true },
  });

  let fixed = 0;
  for (const a of articles) {
    if (!a.sourceUrl) continue;
    const img = await fetchOgImage(a.sourceUrl);
    if (img) {
      await prisma.article.update({ where: { id: a.id }, data: { imageUrl: img } });
      fixed++;
    }
  }
  return { checked: articles.length, fixed };
}

// Reescreve um único artigo com IA.
// forcePublish: publica o artigo (status PUBLISHED) independentemente do feed.
export async function rewriteOne(articleId: string, forcePublish = false): Promise<void> {
  const settings = await getSettings();
  const article = await prisma.article.findUnique({ where: { id: articleId }, include: { feed: true } });
  if (!article) throw new Error("Artigo não encontrado.");

  await prisma.article.update({ where: { id: articleId }, data: { status: "REWRITING", errorMessage: null } });

  try {
    const result = await rewriteArticle(
      {
        title: article.sourceTitle || article.title,
        content: article.sourceContent || article.excerpt || article.title,
        sourceUrl: article.sourceUrl || undefined,
        category: article.category,
      },
      settings
    );

    const autoPublish = forcePublish || (article.feed?.autoPublish ?? false);
    let wpPostId: number | null = null;
    let wpUrl: string | null = null;

    if (autoPublish && settings.wpEnabled === "true") {
      try {
        const wp = await publishToWordPress(settings, {
          title: result.title,
          content: result.content,
          excerpt: result.excerpt,
          slug: article.slug,
        });
        wpPostId = wp.id;
        wpUrl = wp.link;
      } catch {
        /* publica localmente mesmo se o WP falhar */
      }
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: result.title,
        excerpt: result.excerpt,
        content: result.content,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        keywords: result.keywords,
        tags: result.tags,
        keyPoints: JSON.stringify(result.keyPoints || []),
        faq: JSON.stringify(result.faq || []),
        // Mantém a categoria curada do feed; usa a sugestão da IA só quando genérica.
        category: article.category && article.category !== "Geral" ? article.category : result.category || "Geral",
        aiProvider: result.provider,
        status: autoPublish ? "PUBLISHED" : "DRAFT",
        publishedAt: autoPublish ? new Date() : article.publishedAt,
        wpPostId,
        wpUrl,
        errorMessage: null,
      },
    });

    // Notifica os buscadores (IndexNow) quando a notícia é publicada.
    if (autoPublish) await pingIndexNow([`/noticia/${article.slug}`]);
  } catch (e: any) {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "ERROR", errorMessage: e.message?.slice(0, 500) || "Erro desconhecido" },
    });
    throw e;
  }
}

// Executa o ciclo completo: importa todos os feeds ativos e reescreve os pendentes
export async function runPipeline(): Promise<PipelineResult> {
  const result: PipelineResult = { found: 0, created: 0, rewritten: 0, published: 0, errors: 0, message: "" };

  const feeds = await prisma.feed.findMany({ where: { active: true } });
  for (const feed of feeds) {
    try {
      const created = await importFeed(feed.id);
      result.created += created;
    } catch (e: any) {
      result.errors++;
      result.message += `Feed ${feed.title}: ${e.message}\n`;
    }
  }

  const pending = await prisma.article.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: MAX_PER_RUN,
  });
  result.found = pending.length;

  for (const article of pending) {
    try {
      await rewriteOne(article.id);
      result.rewritten++;
      const updated = await prisma.article.findUnique({ where: { id: article.id } });
      if (updated?.status === "PUBLISHED") result.published++;
    } catch (e: any) {
      result.errors++;
      result.message += `Artigo ${article.id}: ${e.message}\n`;
    }
  }

  await prisma.runLog.create({
    data: {
      found: result.found,
      created: result.created,
      rewritten: result.rewritten,
      published: result.published,
      errors: result.errors,
      message: result.message.slice(0, 1000),
    },
  });

  return result;
}

// Reescreve em lote os artigos pendentes e já publica, mantendo a categoria do feed.
export async function runBatchRewritePublish(limit = 10): Promise<PipelineResult> {
  const result: PipelineResult = { found: 0, created: 0, rewritten: 0, published: 0, errors: 0, message: "" };

  const cap = Math.min(Math.max(1, limit), 50);

  // Busca os pendentes e distribui em rodízio entre as categorias, para que
  // toda categoria seja publicada (e não só a maior/mais recente).
  const pendingAll = await prisma.article.findMany({
    where: { status: { in: ["PENDING", "ERROR"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true, category: true },
  });

  const groups = new Map<string, string[]>();
  for (const a of pendingAll) {
    const arr = groups.get(a.category) ?? [];
    arr.push(a.id);
    groups.set(a.category, arr);
  }

  const lists = [...groups.values()];
  const selected: string[] = [];
  let i = 0;
  while (selected.length < cap && lists.some((l) => l.length > 0)) {
    const list = lists[i % lists.length];
    const id = list.shift();
    if (id) selected.push(id);
    i++;
  }
  result.found = selected.length;

  for (const articleId of selected) {
    try {
      await rewriteOne(articleId, true); // força publicação
      result.rewritten++;
      result.published++;
    } catch (e: any) {
      result.errors++;
      result.message += `Artigo ${articleId}: ${e.message}\n`;
    }
  }

  await prisma.runLog.create({
    data: {
      found: result.found,
      created: result.created,
      rewritten: result.rewritten,
      published: result.published,
      errors: result.errors,
      message: ("Lote reescrever+publicar. " + result.message).slice(0, 1000),
    },
  });

  return result;
}
