import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { testApiFootball } from "@/lib/api-football";

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = await getSettings();
  const key = body.apiFootballKey ?? current.apiFootballKey;
  const league = body.copaLeagueId ?? current.copaLeagueId;
  const season = body.copaSeason ?? current.copaSeason;
  const result = await testApiFootball(key, String(league), String(season));
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
