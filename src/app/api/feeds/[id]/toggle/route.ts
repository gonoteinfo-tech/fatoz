import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const feed = await prisma.feed.findUnique({ where: { id: params.id } });
  if (!feed) return NextResponse.json({ error: "Feed não encontrado." }, { status: 404 });
  await prisma.feed.update({ where: { id: params.id }, data: { active: !feed.active } });
  return NextResponse.json({ ok: true });
}
