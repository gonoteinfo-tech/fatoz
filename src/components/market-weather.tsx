// Barra de cotações + previsão do tempo com DADOS REAIS.
// Cotações: AwesomeAPI (sem chave). Clima: Open-Meteo (sem chave).
// É um Server Component assíncrono: os dados são buscados no servidor com cache.

// Cidade exibida no clima — altere as coordenadas para outra cidade.
const CITY = { name: "São Paulo", lat: -23.55, lon: -46.63 };

interface Quote {
  label: string;
  value: string;
  up: boolean;
  pct: string;
}

async function getQuotes(): Promise<Quote[] | null> {
  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL", {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const d = await res.json();
    const fmt = (n: string) =>
      new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(Number(n));
    const build = (raw: any, label: string): Quote => ({
      label,
      value: fmt(raw.bid),
      up: Number(raw.pctChange) >= 0,
      pct: `${Number(raw.pctChange) >= 0 ? "+" : ""}${Number(raw.pctChange).toFixed(2)}%`,
    });
    return [build(d.USDBRL, "Dólar"), build(d.EURBRL, "Euro")];
  } catch {
    return null;
  }
}

function weatherInfo(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Céu limpo" };
  if (code <= 2) return { icon: "🌤️", label: "Parcial. nublado" };
  if (code === 3) return { icon: "☁️", label: "Nublado" };
  if (code <= 48) return { icon: "🌫️", label: "Névoa" };
  if (code <= 57) return { icon: "🌦️", label: "Garoa" };
  if (code <= 67) return { icon: "🌧️", label: "Chuva" };
  if (code <= 77) return { icon: "❄️", label: "Neve" };
  if (code <= 82) return { icon: "🌧️", label: "Pancadas" };
  if (code <= 86) return { icon: "🌨️", label: "Neve" };
  return { icon: "⛈️", label: "Tempestade" };
}

async function getWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${CITY.lat}&longitude=${CITY.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const d = await res.json();
    const info = weatherInfo(d.current.weather_code);
    return {
      city: CITY.name,
      icon: info.icon,
      label: info.label,
      max: Math.round(d.daily.temperature_2m_max[0]),
      min: Math.round(d.daily.temperature_2m_min[0]),
    };
  } catch {
    return null;
  }
}

function Arrow({ up }: { up: boolean }) {
  return <span className={up ? "text-green-600" : "text-red-600"}>{up ? "▲" : "▼"}</span>;
}

export async function MarketWeatherBar() {
  const [quotes, weather] = await Promise.all([getQuotes(), getWeather()]);
  if (!quotes && !weather) return null;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-x-auto px-4 py-1.5 text-sm">
        {/* Cotações */}
        <div className="flex shrink-0 items-center gap-4">
          {quotes?.map((q) => (
            <span key={q.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-slate-800">{q.label}</span>
              <Arrow up={q.up} />
              <span className={`font-bold ${q.up ? "text-green-600" : "text-red-600"}`} title={q.pct}>
                {q.value}
              </span>
            </span>
          ))}
        </div>

        {/* Clima */}
        {weather && (
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none" title={weather.label}>{weather.icon}</span>
            <span className="font-semibold text-slate-700">{weather.city}</span>
            <span className="font-bold text-red-600">{weather.max}°C</span>
            <span className="font-bold text-blue-600">{weather.min}°C</span>
          </div>
        )}
      </div>
    </div>
  );
}
