import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { publishToWordPress } from "@/lib/wordpress";
import { pingIndexNow } from "@/lib/indexnow";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });

  const settings = await getSettings();
  let wpPostId = article.wpPostId;
  let wpUrl = article.wpUrl;

  // publica também no WordPress, se habilitado e ainda não publicado lá
  if (settings.wpEnabled === "true" && !wpPostId) {
    try {
      const wp = await publishToWordPress(settings, {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: article.slug,
      });
      wpPostId = wp.id;
      wpUrl = wp.link;
    } catch {
      /* segue publicando localmente */
    }
  }

  await prisma.article.update({
    where: { id: params.id },
    data: { status: "PUBLISHED", publishedAt: article.publishedAt ?? new Date(), wpPostId, wpUrl },
  });

  await pingIndexNow([`/noticia/${article.slug}`]);

  return NextResponse.json({ ok: true });
}
