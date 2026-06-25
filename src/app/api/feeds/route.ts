import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fetchFeed } from "@/lib/rss";

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { url, title, category, autoPublish } = await req.json().catch(() => ({}));
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL do feed é obrigatória." }, { status: 400 });
  }

  const existing = await prisma.feed.findUnique({ where: { url } });
  if (existing) return NextResponse.json({ error: "Esse feed já está cadastrado." }, { status: 409 });

  let resolvedTitle = (title || "").trim();
  try {
    const parsed = await fetchFeed(url);
    if (!resolvedTitle) resolvedTitle = parsed.title;
  } catch (e: any) {
    return NextResponse.json({ error: `Não foi possível ler o feed: ${e.message}` }, { status: 400 });
  }

  const feed = await prisma.feed.create({
    data: {
      url,
      title: resolvedTitle || url,
      category: (category || "Geral").trim() || "Geral",
      autoPublish: Boolean(autoPublish),
    },
  });

  return NextResponse.json({ ok: true, feed });
}

export async function GET() {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const feeds = await prisma.feed.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ feeds });
}
