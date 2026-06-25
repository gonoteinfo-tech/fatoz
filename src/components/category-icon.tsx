// Ícone (SVG inline, estilo moderno) escolhido pela categoria da notícia.
// Faz correspondência por palavra-chave, com um ícone padrão de "notícias".

type IconKey =
  | "tech" | "sports" | "economy" | "politics" | "world" | "health"
  | "entertainment" | "science" | "games" | "auto" | "education" | "news";

const PATHS: Record<IconKey, string> = {
  tech: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 7h10v10H7zM10 10h4v4h-4z",
  sports: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20m10-10H2m4-7l12 14m0-14L6 19",
  economy: "M3 3v18h18M7 15l3-3 3 3 5-6",
  politics: "M3 21h18M5 21V10m14 11V10M3 10l9-7 9 7M9 21v-6h6v6",
  world: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20",
  health: "M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 000-7.8z",
  entertainment: "M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z",
  science: "M9 2h6M10 2v6L5 19a2 2 0 002 3h10a2 2 0 002-3l-5-11V2M7.5 14h9",
  games: "M7 12h4m-2-2v4m6-1h.01M18 11h.01M5 8h14a2 2 0 012 2v4a3 3 0 01-5.2 2H8.2A3 3 0 013 14v-4a2 2 0 012-2z",
  auto: "M5 13l2-5a2 2 0 011.9-1.3h6.2A2 2 0 0117 8l2 5m-14 0h14m-14 0v4m14-4v4M7 17h.01M17 17h.01",
  education: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5",
  news: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2zM8 8h6M8 12h8M8 16h8",
};

function pick(category: string): IconKey {
  const c = category.toLowerCase();
  const has = (...k: string[]) => k.some((x) => c.includes(x));
  if (has("tecnolog", "tech", "digital", "internet", "ia", "intelig")) return "tech";
  if (has("esport", "futebol", "sport")) return "sports";
  if (has("econ", "negóci", "negoci", "dinheiro", "financ", "mercado")) return "economy";
  if (has("polít", "polit", "govern", "eleic", "eleiç")) return "politics";
  if (has("mundo", "internacion", "global")) return "world";
  if (has("saúde", "saude", "bem-estar", "medic")) return "health";
  if (has("entreten", "cultura", "celebrid", "famos", "tv", "música", "musica", "cinema", "novela")) return "entertainment";
  if (has("ciênc", "cienc", "espaço", "espaco", "astro")) return "science";
  if (has("game", "jogo")) return "games";
  if (has("auto", "carro", "veícul", "veicul", "moto")) return "auto";
  if (has("educa", "ensino", "concurso", "vestibular")) return "education";
  return "news";
}

export function CategoryIcon({ category, className = "h-5 w-5" }: { category: string; className?: string }) {
  const key = pick(category);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[key]} />
    </svg>
  );
}
