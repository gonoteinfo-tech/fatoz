import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  await prisma.feed.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
