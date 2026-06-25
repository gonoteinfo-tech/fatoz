// Previsão do tempo via Open-Meteo (sem chave). Reutilizado pela barra e pela sidebar.

export const WEATHER_CITY = { name: "São Paulo", lat: -23.55, lon: -46.63 };

export type WeatherKind = "sun" | "cloud" | "rain" | "storm" | "snow" | "fog";

export interface Weather {
  city: string;
  current: number;
  max: number;
  min: number;
  label: string;
  kind: WeatherKind;
}

export function weatherKind(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: "sun", label: "Céu limpo" };
  if (code <= 2) return { kind: "sun", label: "Parcial. nublado" };
  if (code === 3) return { kind: "cloud", label: "Nublado" };
  if (code <= 48) return { kind: "fog", label: "Névoa" };
  if (code <= 57) return { kind: "rain", label: "Garoa" };
  if (code <= 67) return { kind: "rain", label: "Chuva" };
  if (code <= 77) return { kind: "snow", label: "Neve" };
  if (code <= 82) return { kind: "rain", label: "Pancadas" };
  if (code <= 86) return { kind: "snow", label: "Neve" };
  return { kind: "storm", label: "Tempestade" };
}

export async function getWeather(): Promise<Weather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_CITY.lat}&longitude=${WEATHER_CITY.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const d = await res.json();
    const { kind, label } = weatherKind(d.current.weather_code);
    return {
      city: WEATHER_CITY.name,
      current: Math.round(d.current.temperature_2m),
      max: Math.round(d.daily.temperature_2m_max[0]),
      min: Math.round(d.daily.temperature_2m_min[0]),
      label,
      kind,
    };
  } catch {
    return null;
  }
}
