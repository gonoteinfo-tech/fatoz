// Tabela REAL da Copa do Mundo FIFA 2026 (EUA/Canadá/México) — fase de grupos.
// Confrontos, datas, grupos e horários (Brasília) reais; fonte: sorteio oficial.
// Emissoras com direitos no Brasil: CazéTV (YouTube, todos os jogos),
// Grupo Globo (TV Globo / SporTV / Globoplay), SBT (TV aberta) e N Sports (YouTube).
// A grade jogo a jogo das emissoras pode mudar — ajuste o campo "channels".

export interface CopaTeam {
  code: string; // sigla (ex: BRA)
  name: string; // nome (ex: Brasil)
  flag: string; // código flagcdn (ex: br | gb-eng)
}

export interface CopaMatch {
  id: string;
  date: string; // rótulo da data (ex: "Terça, 23 de junho")
  time: string; // horário de Brasília (ex: "17H")
  stage: string; // grupo (ex: "Grupo C")
  home: CopaTeam;
  away: CopaTeam;
  channels: string[]; // onde assistir
  homeScore?: number; // placar (preencha quando o jogo terminar)
  awayScore?: number;
  iso?: string; // data/hora real do jogo (ISO) — usada para ordenar/filtrar
}

export interface TeamStanding {
  team: CopaTeam;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number; // gols pró
  ga: number; // gols contra
  gd: number; // saldo
  points: number;
}

const T = {
  BRA: { code: "BRA", name: "Brasil", flag: "br" },
  ESC: { code: "ESC", name: "Escócia", flag: "gb-sct" },
  MAR: { code: "MAR", name: "Marrocos", flag: "ma" },
  HAI: { code: "HAI", name: "Haiti", flag: "ht" },
  ING: { code: "ING", name: "Inglaterra", flag: "gb-eng" },
  GAN: { code: "GAN", name: "Gana", flag: "gh" },
  PAN: { code: "PAN", name: "Panamá", flag: "pa" },
  CRO: { code: "CRO", name: "Croácia", flag: "hr" },
  POR: { code: "POR", name: "Portugal", flag: "pt" },
  UZB: { code: "UZB", name: "Uzbequistão", flag: "uz" },
  COL: { code: "COL", name: "Colômbia", flag: "co" },
  RDC: { code: "RDC", name: "Rep. Dem. Congo", flag: "cd" },
  SUI: { code: "SUI", name: "Suíça", flag: "ch" },
  CAN: { code: "CAN", name: "Canadá", flag: "ca" },
  BOS: { code: "BOS", name: "Bósnia e Herz.", flag: "ba" },
  CAT: { code: "CAT", name: "Catar", flag: "qa" },
  TCH: { code: "TCH", name: "Rep. Tcheca", flag: "cz" },
  MEX: { code: "MEX", name: "México", flag: "mx" },
  AFS: { code: "AFS", name: "África do Sul", flag: "za" },
  COR: { code: "COR", name: "Coreia do Sul", flag: "kr" },
  EQU: { code: "EQU", name: "Equador", flag: "ec" },
  ALE: { code: "ALE", name: "Alemanha", flag: "de" },
  CUR: { code: "CUR", name: "Curaçao", flag: "cw" },
  CMA: { code: "CMA", name: "Costa do Marfim", flag: "ci" },
  JAP: { code: "JAP", name: "Japão", flag: "jp" },
  SUE: { code: "SUE", name: "Suécia", flag: "se" },
  TUN: { code: "TUN", name: "Tunísia", flag: "tn" },
  HOL: { code: "HOL", name: "Holanda", flag: "nl" },
  TUR: { code: "TUR", name: "Turquia", flag: "tr" },
  EUA: { code: "EUA", name: "Estados Unidos", flag: "us" },
  PAR: { code: "PAR", name: "Paraguai", flag: "py" },
  AUS: { code: "AUS", name: "Austrália", flag: "au" },
  NOR: { code: "NOR", name: "Noruega", flag: "no" },
  FRA: { code: "FRA", name: "França", flag: "fr" },
  SEN: { code: "SEN", name: "Senegal", flag: "sn" },
  IRQ: { code: "IRQ", name: "Iraque", flag: "iq" },
  CAB: { code: "CAB", name: "Cabo Verde", flag: "cv" },
  ARA: { code: "ARA", name: "Arábia Saudita", flag: "sa" },
  URU: { code: "URU", name: "Uruguai", flag: "uy" },
  ESP: { code: "ESP", name: "Espanha", flag: "es" },
  EGI: { code: "EGI", name: "Egito", flag: "eg" },
  IRA: { code: "IRA", name: "Irã", flag: "ir" },
  NZL: { code: "NZL", name: "Nova Zelândia", flag: "nz" },
  BEL: { code: "BEL", name: "Bélgica", flag: "be" },
} satisfies Record<string, CopaTeam>;

export const COPA_MATCHES: CopaMatch[] = [
  // Terça, 23 de junho
  { id: "j01", date: "Terça, 23 de junho", time: "14H", stage: "Grupo K", home: T.POR, away: T.UZB, channels: ["SporTV", "CazéTV"] },
  { id: "j02", date: "Terça, 23 de junho", time: "17H", stage: "Grupo L", home: T.ING, away: T.GAN, channels: ["SBT", "CazéTV", "N Sports"] },
  { id: "j03", date: "Terça, 23 de junho", time: "20H", stage: "Grupo L", home: T.PAN, away: T.CRO, channels: ["Globoplay", "CazéTV"] },
  { id: "j04", date: "Terça, 23 de junho", time: "23H", stage: "Grupo K", home: T.COL, away: T.RDC, channels: ["SporTV", "CazéTV"] },

  // Quarta, 24 de junho
  { id: "j05", date: "Quarta, 24 de junho", time: "16H", stage: "Grupo B", home: T.SUI, away: T.CAN, channels: ["SporTV", "CazéTV"] },
  { id: "j06", date: "Quarta, 24 de junho", time: "16H", stage: "Grupo B", home: T.BOS, away: T.CAT, channels: ["CazéTV"] },
  { id: "j07", date: "Quarta, 24 de junho", time: "19H", stage: "Grupo C", home: T.ESC, away: T.BRA, channels: ["TV Globo", "SporTV", "SBT", "CazéTV"] },
  { id: "j08", date: "Quarta, 24 de junho", time: "19H", stage: "Grupo C", home: T.MAR, away: T.HAI, channels: ["Globoplay", "CazéTV"] },
  { id: "j09", date: "Quarta, 24 de junho", time: "22H", stage: "Grupo A", home: T.TCH, away: T.MEX, channels: ["SporTV", "CazéTV"] },
  { id: "j10", date: "Quarta, 24 de junho", time: "22H", stage: "Grupo A", home: T.AFS, away: T.COR, channels: ["CazéTV"] },

  // Quinta, 25 de junho
  { id: "j11", date: "Quinta, 25 de junho", time: "17H", stage: "Grupo E", home: T.EQU, away: T.ALE, channels: ["SBT", "CazéTV", "N Sports"] },
  { id: "j12", date: "Quinta, 25 de junho", time: "17H", stage: "Grupo E", home: T.CUR, away: T.CMA, channels: ["CazéTV"] },
  { id: "j13", date: "Quinta, 25 de junho", time: "20H", stage: "Grupo F", home: T.JAP, away: T.SUE, channels: ["SporTV", "CazéTV"] },
  { id: "j14", date: "Quinta, 25 de junho", time: "20H", stage: "Grupo F", home: T.TUN, away: T.HOL, channels: ["Globoplay", "CazéTV"] },
  { id: "j15", date: "Quinta, 25 de junho", time: "23H", stage: "Grupo D", home: T.TUR, away: T.EUA, channels: ["SporTV", "CazéTV"] },
  { id: "j16", date: "Quinta, 25 de junho", time: "23H", stage: "Grupo D", home: T.PAR, away: T.AUS, channels: ["CazéTV"] },

  // Sexta, 26 de junho
  { id: "j17", date: "Sexta, 26 de junho", time: "16H", stage: "Grupo I", home: T.NOR, away: T.FRA, channels: ["SBT", "CazéTV", "N Sports"] },
  { id: "j18", date: "Sexta, 26 de junho", time: "16H", stage: "Grupo I", home: T.SEN, away: T.IRQ, channels: ["CazéTV"] },
  { id: "j19", date: "Sexta, 26 de junho", time: "21H", stage: "Grupo H", home: T.CAB, away: T.ARA, channels: ["CazéTV"] },
  { id: "j20", date: "Sexta, 26 de junho", time: "21H", stage: "Grupo H", home: T.URU, away: T.ESP, channels: ["SporTV", "Globoplay", "CazéTV"] },

  // Sábado, 27 de junho
  { id: "j21", date: "Sábado, 27 de junho", time: "00H", stage: "Grupo G", home: T.EGI, away: T.IRA, channels: ["CazéTV"] },
  { id: "j22", date: "Sábado, 27 de junho", time: "00H", stage: "Grupo G", home: T.NZL, away: T.BEL, channels: ["SporTV", "CazéTV"] },
  { id: "j23", date: "Sábado, 27 de junho", time: "18H", stage: "Grupo L", home: T.PAN, away: T.ING, channels: ["SBT", "CazéTV", "N Sports"] },
  { id: "j24", date: "Sábado, 27 de junho", time: "18H", stage: "Grupo L", home: T.CRO, away: T.GAN, channels: ["Globoplay", "CazéTV"] },
];

// Agrupa os jogos por data, preservando a ordem.
export function matchesByDate(matches: CopaMatch[] = COPA_MATCHES): { date: string; matches: CopaMatch[] }[] {
  const groups: { date: string; matches: CopaMatch[] }[] = [];
  for (const m of matches) {
    let g = groups.find((x) => x.date === m.date);
    if (!g) {
      g = { date: m.date, matches: [] };
      groups.push(g);
    }
    g.matches.push(m);
  }
  return groups;
}

export function flagUrl(code: string, size = 80): string {
  // Aceita URL completa (logos da API-Football) ou código flagcdn.
  if (/^https?:\/\//.test(code)) return code;
  return `https://flagcdn.com/w${size}/${code}.png`;
}

// Calcula a classificação de cada grupo a partir dos resultados dos jogos.
// Só contabiliza partidas com placar preenchido (homeScore/awayScore).
export function computeStandings(matches: CopaMatch[] = COPA_MATCHES): { group: string; table: TeamStanding[] }[] {
  const groups = new Map<string, Map<string, TeamStanding>>();

  const ensure = (group: string, team: CopaTeam): TeamStanding => {
    if (!groups.has(group)) groups.set(group, new Map());
    const gm = groups.get(group)!;
    if (!gm.has(team.code)) {
      gm.set(team.code, { team, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    }
    return gm.get(team.code)!;
  };

  for (const m of matches) {
    const home = ensure(m.stage, m.home);
    const away = ensure(m.stage, m.away);
    if (typeof m.homeScore !== "number" || typeof m.awayScore !== "number") continue;

    home.played++;
    away.played++;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.win++;
      home.points += 3;
      away.loss++;
    } else if (m.homeScore < m.awayScore) {
      away.win++;
      away.points += 3;
      home.loss++;
    } else {
      home.draw++;
      away.draw++;
      home.points++;
      away.points++;
    }
  }

  const result = [...groups.entries()].map(([group, gm]) => {
    const table = [...gm.values()].map((s) => ({ ...s, gd: s.gf - s.ga }));
    table.sort(
      (a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.name.localeCompare(b.team.name, "pt")
    );
    return { group, table };
  });

  result.sort((a, b) => a.group.localeCompare(b.group, "pt"));
  return result;
}

// Indica se já há algum placar lançado (jogos encerrados).
export function hasResults(): boolean {
  return COPA_MATCHES.some((m) => typeof m.homeScore === "number" && typeof m.awayScore === "number");
}
