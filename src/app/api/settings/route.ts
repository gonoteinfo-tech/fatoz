import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  if (!getSession()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "aiProvider", "claudeApiKey", "claudeModel", "geminiApiKey", "geminiModel",
    "openaiApiKey", "openaiModel", "rewriteLanguage", "rewriteTone", "rewriteInstructions",
    "siteName", "siteDescription", "wpEnabled", "wpUrl", "wpUser", "wpAppPassword",
    "apiFootballKey", "copaLeagueId", "copaSeason",
    "siteUrl", "ogImage", "twitterHandle", "googleVerification", "publisherName",
    "siteTagline", "themeColor", "themeColorSecondary", "googleAnalyticsId", "adsenseClient",
    "heroImage", "heroTitle", "heroSubtitle", "heroLink", "menuLinks",
    "logo", "logoDark", "logoHeight", "logoMaxWidth", "logoFit", "favicon", "footerText", "contactEmail",
    "socialInstagram", "socialFacebook", "socialTwitter", "socialYoutube",
  ];
  const data: Record<string, string> = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  await saveSettings(data);
  return NextResponse.json({ ok: true });
}
