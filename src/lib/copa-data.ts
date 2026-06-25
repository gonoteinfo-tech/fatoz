// Camada de dados da Copa: usa a API-Football quando há chave configurada;
// caso contrário, cai no conjunto estático (src/lib/copa.ts).

import { getSettings } from "./settings";
import {
  COPA_MATCHES,
  matchesByDate,
  computeStandings,
  type CopaMatch,
  type TeamStanding,
} from "./copa";
import { fetchApiFixtures, fetchApiStandings } from "./api-football";

export type CopaSource = "api" | "static";

export async function getCopaSource(): Promise<CopaSource> {
  const s = await getSettings();
  return s.apiFootballKey ? "api" : "static";
}

export async function getCopaMatches(): Promise<{ source: CopaSource; matches: CopaMatch[] }> {
  const s = await getSettings();
  if (s.apiFootballKey) {
    try {
      const matches = await fetchApiFixtures();
      if (matches.length) return { source: "api", matches };
    } catch {
      /* fallback abaixo */
    }
  }
  return { source: "static", matches: COPA_MATCHES };
}

export async function getCopaGroupedMatches(): Promise<{
  source: CopaSource;
  groups: { date: string; matches: CopaMatch[] }[];
}> {
  const { source, matches } = await getCopaMatches();
  return { source, groups: matchesByDate(matches) };
}

export async function getCopaStandings(): Promise<{
  source: CopaSource;
  standings: { group: string; table: TeamStanding[] }[];
}> {
  const s = await getSettings();
  if (s.apiFootballKey) {
    try {
      const standings = await fetchApiStandings();
      if (standings.length) return { source: "api", standings };
    } catch {
      /* fallback abaixo */
    }
  }
  return { source: "static", standings: computeStandings(COPA_MATCHES) };
}

// Próximos jogos para o ticker da barra (os 6 primeiros).
export async function getCopaTicker(): Promise<CopaMatch[]> {
  const { matches } = await getCopaMatches();
  return matches.slice(0, 6);
}
