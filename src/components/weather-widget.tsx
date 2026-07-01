"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "sun" | "cloud" | "rain" | "storm" | "snow" | "fog";

interface City {
  name: string;
  lat: number;
  lon: number;
  region?: string;
}

const DEFAULT_CITY: City = { name: "São Paulo", lat: -23.55, lon: -46.63, region: "SP" };

function kindOf(code: number): { kind: Kind; label: string } {
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

function WxIcon({ kind, className = "h-14 w-14" }: { kind: Kind; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {kind === "sun" && (
        <g className="wx-sun" fill="#fde68a" stroke="#fbbf24" strokeWidth="2">
          <circle cx="32" cy="32" r="11" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return <line key={i} x1={32 + Math.cos(a) * 16} y1={32 + Math.sin(a) * 16} x2={32 + Math.cos(a) * 22} y2={32 + Math.sin(a) * 22} strokeLinecap="round" />;
          })}
        </g>
      )}
      {kind !== "sun" && (
        <>
          <g className="wx-cloud">
            <path d="M20 40a10 10 0 010-20 12 12 0 0123-3 9 9 0 011 18z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
          </g>
          {(kind === "rain" || kind === "storm") && (
            <g stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round">
              <line className="wx-drop" x1="26" y1="44" x2="26" y2="50" />
              <line className="wx-drop" x1="34" y1="44" x2="34" y2="50" />
              <line className="wx-drop" x1="42" y1="44" x2="42" y2="50" />
            </g>
          )}
          {kind === "storm" && <polygon className="wx-bolt" points="33,42 27,52 32,52 29,60 39,48 33,48" fill="#facc15" />}
          {kind === "snow" && (
            <g fill="#e0f2fe">
              <circle className="wx-bolt" cx="26" cy="48" r="2.5" />
              <circle className="wx-bolt" cx="34" cy="50" r="2.5" />
              <circle className="wx-bolt" cx="42" cy="48" r="2.5" />
            </g>
          )}
          {kind === "fog" && (
            <g stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round">
              <line className="wx-bolt" x1="22" y1="46" x2="44" y2="46" />
              <line className="wx-bolt" x1="24" y1="52" x2="42" y2="52" />
            </g>
          )}
        </>
      )}
    </svg>
  );
}

export function WeatherWidget() {
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("fatoz_city");
      if (s) setCity(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [city]);

  useEffect(() => {
    if (!searchOpen || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=pt&format=json`);
        const d = await r.json();
        setResults(d.results || []);
      } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [q, searchOpen]);

  function choose(r: any) {
    const chosen: City = { name: r.name, lat: r.latitude, lon: r.longitude, region: r.admin1 || r.country_code };
    setCity(chosen);
    try {
      localStorage.setItem("fatoz_city", JSON.stringify(chosen));
    } catch {}
    setSearchOpen(false);
    setQ("");
    setResults([]);
  }

  const cur = data?.current;
  const info = cur ? kindOf(cur.weather_code) : null;
  const days: any[] = data?.daily?.time || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Cabeçalho: cidade + lupa */}
      <div className="relative bg-gradient-to-br from-brand-600 to-accent-500 p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold opacity-90">
              {city.name}
              {city.region ? <span className="opacity-70"> · {city.region}</span> : null}
            </p>
            {loading ? (
              <p className="mt-1 text-3xl font-black">--°</p>
            ) : cur ? (
              <>
                <p className="text-4xl font-black leading-none">{Math.round(cur.temperature_2m)}°</p>
                <p className="mt-1 text-xs font-medium opacity-90">
                  {info?.label} · sensação {Math.round(cur.apparent_temperature)}°
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs">Indisponível</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              aria-label="Buscar cidade"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
            {info && !loading && <WxIcon kind={info.kind} className="h-12 w-12" />}
          </div>
        </div>

        {searchOpen && (
          <div className="mt-3">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Digite uma cidade..."
              className="w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-800 outline-none"
            />
            {results.length > 0 && (
              <ul className="mt-1 max-h-52 overflow-auto rounded-lg bg-white text-slate-800 shadow-lg">
                {results.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => choose(r)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-xs text-slate-400">
                        {[r.admin1, r.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Detalhes */}
      {cur && !loading && (
        <div className="grid grid-cols-2 gap-px bg-slate-100 text-center text-sm">
          <Detail label="Umidade" value={`${Math.round(cur.relative_humidity_2m)}%`} />
          <Detail label="Vento" value={`${Math.round(cur.wind_speed_10m)} km/h`} />
          <Detail label="Chuva" value={`${Math.round(data.daily.precipitation_probability_max?.[0] ?? 0)}%`} />
          <Detail
            label="Máx / Mín"
            value={
              <>
                <span className="text-red-600">{Math.round(data.daily.temperature_2m_max[0])}°</span>
                {" / "}
                <span className="text-blue-600">{Math.round(data.daily.temperature_2m_min[0])}°</span>
              </>
            }
          />
        </div>
      )}

      {/* Próximos dias */}
      {days.length > 1 && !loading && (
        <div className="flex divide-x divide-slate-100 border-t border-slate-100">
          {days.slice(1, 4).map((d: string, i: number) => {
            const k = kindOf(data.daily.weather_code[i + 1]);
            const wd = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(new Date(d)).replace(".", "");
            return (
              <div key={d} className="flex-1 py-2 text-center">
                <p className="text-xs font-semibold capitalize text-slate-500">{wd}</p>
                <div className="mx-auto my-1 w-8">
                  <WxIcon kind={k.kind} className="h-8 w-8" />
                </div>
                <p className="text-xs">
                  <span className="font-bold text-slate-700">{Math.round(data.daily.temperature_2m_max[i + 1])}°</span>
                  <span className="text-slate-400"> {Math.round(data.daily.temperature_2m_min[i + 1])}°</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white py-2.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  );
}
