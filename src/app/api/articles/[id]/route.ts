import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "title", "slug", "excerpt", "content", "imageUrl", "category",
    "tags", "metaTitle", "metaDescription", "keywords", "status",
  ];
  const data: Record<string, any> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  if (data.status === "PUBLISHED") {
    const current = await prisma.article.findUnique({ where: { id: params.id } });
    if (current && current.status !== "PUBLISHED") data.publishedAt = new Date();
  }

  try {
    const article = await prisma.article.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true, article });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao salvar." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  await prisma.article.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
