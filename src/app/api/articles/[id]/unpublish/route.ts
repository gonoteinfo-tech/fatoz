import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  await prisma.article.update({ where: { id: params.id }, data: { status: "DRAFT" } });
  return NextResponse.json({ ok: true });
}
