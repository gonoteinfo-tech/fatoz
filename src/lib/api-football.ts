// Integração com a API-Football (https://www.api-football.com/).
// Busca jogos e classificação oficiais da Copa e mapeia para os tipos do site.
// A chave é configurada no painel (/admin/configuracoes).

import { getSettings } from "./settings";
import type { CopaMatch, CopaTeam, TeamStanding } from "./copa";

const BASE = "https://v3.football.api-sports.io";

function dateLabel(iso: string): string {
  const s = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1); // "Terça-feira, 24 de junho"
}

function timeLabel(iso: string): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).formatToParts(new Date(iso));
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return mm === "00" ? `${hh}H` : `${hh}h${mm}`;
}

function abbrev(name: string): string {
  const clean = name.replace(/[^A-Za-zÀ-ÿ ]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  return clean.slice(0, 3).toUpperCase();
}

function translateGroup(g: string): string {
  // "Group A" -> "Grupo A"
  return g.replace(/group/i, "Grupo").trim();
}

const FINISHED = new Set(["FT", "AET", "PEN"]);

async function apiGet(path: string, key: string, revalidate: number): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": key },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API-Football ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data?.errors && Object.keys(data.errors).length) {
    throw new Error(`API-Football: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

// ---- Jogos ----
export async function fetchApiFixtures(): Promise<CopaMatch[]> {
  const s = await getSettings();
  if (!s.apiFootballKey) return [];

  // Mapa time -> grupo (vem da classificação)
  const teamGroup = await fetchTeamGroupMap(s.apiFootballKey, s.copaLeagueId, s.copaSeason);

  const data = await apiGet(
    `/fixtures?league=${s.copaLeagueId}&season=${s.copaSeason}`,
    s.apiFootballKey,
    300
  );

  const fixtures = (data.response ?? []) as any[];
  fixtures.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());

  return fixtures.map((f): CopaMatch => {
    const mkTeam = (t: any): CopaTeam => ({ code: abbrev(t.name), name: t.name, flag: t.logo });
    const finished = FINISHED.has(f.fixture.status?.short);
    const group = teamGroup.get(f.teams.home.id) || translateGroup(f.league?.round || "Fase de grupos");
    return {
      id: String(f.fixture.id),
      date: dateLabel(f.fixture.date),
      time: timeLabel(f.fixture.date),
      stage: group,
      home: mkTeam(f.teams.home),
      away: mkTeam(f.teams.away),
      channels: [],
      homeScore: finished ? f.goals.home ?? undefined : undefined,
      awayScore: finished ? f.goals.away ?? undefined : undefined,
    };
  });
}

async function fetchTeamGroupMap(key: string, league: string, season: string): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const data = await apiGet(`/standings?league=${league}&season=${season}`, key, 300);
    const groups: any[][] = data.response?.[0]?.league?.standings ?? [];
    for (const group of groups) {
      for (const row of group) {
        if (row.team?.id) map.set(row.team.id, translateGroup(row.group || ""));
      }
    }
  } catch {
    /* sem classificação ainda */
  }
  return map;
}

// ---- Classificação ----
export async function fetchApiStandings(): Promise<{ group: string; table: TeamStanding[] }[]> {
  const s = await getSettings();
  if (!s.apiFootballKey) return [];

  const data = await apiGet(
    `/standings?league=${s.copaLeagueId}&season=${s.copaSeason}`,
    s.apiFootballKey,
    300
  );

  const groups: any[][] = data.response?.[0]?.league?.standings ?? [];
  return groups
    .map((group) => ({
      group: translateGroup(group[0]?.group || ""),
      table: group.map(
        (row): TeamStanding => ({
          team: { code: abbrev(row.team.name), name: row.team.name, flag: row.team.logo },
          played: row.all?.played ?? 0,
          win: row.all?.win ?? 0,
          draw: row.all?.draw ?? 0,
          loss: row.all?.lose ?? 0,
          gf: row.all?.goals?.for ?? 0,
          ga: row.all?.goals?.against ?? 0,
          gd: row.goalsDiff ?? 0,
          points: row.points ?? 0,
        })
      ),
    }))
    .sort((a, b) => a.group.localeCompare(b.group, "pt"));
}

// Testa a chave / conexão com a API-Football.
export async function testApiFootball(key: string, league: string, season: string): Promise<{ ok: boolean; message: string }> {
  try {
    if (!key) return { ok: false, message: "Informe a chave da API-Football." };
    const data = await apiGet(`/standings?league=${league}&season=${season}`, key, 0);
    const groups = data.response?.[0]?.league?.standings?.length ?? 0;
    if (groups === 0) {
      return { ok: true, message: "Conexão OK, mas ainda não há classificação para esta liga/temporada (verifique league/season)." };
    }
    return { ok: true, message: `Conexão OK — ${groups} grupos encontrados.` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Falha na conexão com a API-Football." };
  }
}
