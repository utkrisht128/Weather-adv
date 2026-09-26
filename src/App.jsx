import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "./components/SearchBar";
import Hero from "./components/Hero";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import Details from "./components/Details";
import WeatherScene from "./components/WeatherScene";
import { CloseIcon } from "./components/Icons";
import { fetchWeather, reverseGeocode } from "./lib/api";
import { describe, intensity } from "./lib/weatherCodes";
import { hourLabel } from "./lib/format";
import { useLocalStorage } from "./lib/useLocalStorage";

const DEFAULT_PLACE = { name: "Delhi", region: "Delhi, India", country: "IN", lat: 28.6139, lon: 77.209 };
const REFRESH_MS = 10 * 60 * 1000;

const sameCoords = (a, b) => Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01;

// One-line plain-language summary of what's coming up.
function buildInsight(hours, daily, units) {
  const next = hours.slice(0, 12);
  const wetIdx = next.findIndex((h) => h.pop >= 50);
  if (wetIdx === 0) {
    const dry = next.findIndex((h) => h.pop < 30);
    return dry > 0
      ? `Rain likely now, easing around ${hourLabel(next[dry].time)}.`
      : "Rain likely for the next few hours — keep an umbrella handy.";
  }
  if (wetIdx > 0) return `Rain likely around ${hourLabel(next[wetIdx].time)}.`;

  const diff = daily.temperature_2m_max[1] - daily.temperature_2m_max[0];
  if (Math.abs(diff) >= 3) {
    const d = Math.round(Math.abs(units === "F" ? (diff * 9) / 5 : diff));
    return `Tomorrow will be ${d}° ${diff > 0 ? "warmer" : "cooler"} than today.`;
  }
  if (daily.uv_index_max[0] >= 8) return "Very high UV today — sunscreen recommended.";
  return "No rain expected in the next 12 hours.";
}

export default function App() {
  const [place, setPlace] = useLocalStorage("skycast:place", DEFAULT_PLACE);
  const [units, setUnits] = useLocalStorage("skycast:units", "C");
  const [favorites, setFavorites] = useLocalStorage("skycast:favorites", []);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchWeather(place, ctrl.signal)
      .then((w) => {
        setWeather(w);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError("Couldn't load the weather. Check your connection and try again.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [place, refreshTick]);

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const info = await reverseGeocode(coords.latitude, coords.longitude);
        setPlace({ ...info, lat: coords.latitude, lon: coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Location access was denied. Search for a city instead.");
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [setPlace]);

  const derived = useMemo(() => {
    if (!weather) return null;
    const { hourly, current } = weather;
    const nowKey = current.time.slice(0, 13);
    let start = hourly.time.findIndex((t) => t.slice(0, 13) >= nowKey);
    if (start < 0) start = 0;
    const hours = hourly.time.slice(start, start + 24).map((time, k) => ({
      time,
      temp: hourly.temperature_2m[start + k],
      code: hourly.weather_code[start + k],
      pop: hourly.precipitation_probability[start + k],
      isDay: hourly.is_day[start + k],
    }));
    const hourNow = {
      uv: hourly.uv_index[start],
      dewPoint: hourly.dew_point_2m[start],
      visibility: hourly.visibility[start],
      pressureIn3h: hourly.pressure_msl[start + 3] ?? current.pressure_msl,
    };
    return { hours, hourNow };
  }, [weather]);

  const isFavorite = favorites.some((f) => sameCoords(f, place));
  const toggleFavorite = () =>
    setFavorites((fs) => (isFavorite ? fs.filter((f) => !sameCoords(f, place)) : [...fs, place].slice(-8)));

  const code = weather?.current.weather_code;
  const { scene } = describe(code ?? 0);
  const isDay = weather ? !!weather.current.is_day : true;

  return (
    <div className="app" data-scene={scene} data-day={isDay ? "day" : "night"}>
      <WeatherScene scene={scene} isDay={isDay} intensity={intensity(code)} />

      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true" />
          SkyCast
        </div>
        <SearchBar onSelect={setPlace} onLocate={locate} locating={locating} />
        <div className="unit-toggle glass" role="group" aria-label="Temperature units">
          {["C", "F"].map((u) => (
            <button key={u} className={units === u ? "on" : ""} onClick={() => setUnits(u)} aria-pressed={units === u}>
              °{u}
            </button>
          ))}
          <span className="unit-thumb" style={{ transform: `translateX(${units === "F" ? 100 : 0}%)` }} />
        </div>
      </header>

      {favorites.length > 0 && (
        <nav className="favorites" aria-label="Favorite places">
          {favorites.map((f) => (
            <span key={`${f.lat},${f.lon}`} className={`chip glass${sameCoords(f, place) ? " current" : ""}`}>
              <button onClick={() => setPlace(f)}>{f.name}</button>
              <button
                className="chip-x"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFavorites((fs) => fs.filter((x) => !sameCoords(x, f)))}
              >
                <CloseIcon />
              </button>
            </span>
          ))}
        </nav>
      )}

      {error && (
        <div className="toast glass" role="alert">
          {error}
          <button onClick={() => (weather ? setError(null) : setRefreshTick((t) => t + 1))}>
            {weather ? "Dismiss" : "Retry"}
          </button>
        </div>
      )}

      {!weather && loading && <Skeleton />}

      {weather && derived && (
        <main className={`content${loading ? " refreshing" : ""}`} key={`${place.lat},${place.lon}`}>
          <Hero
            place={place}
            weather={weather}
            units={units}
            insight={buildInsight(derived.hours, weather.daily, units)}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
          <div className="grid">
            <div className="col-main">
              <HourlyForecast hours={derived.hours} units={units} />
              <Details weather={weather} hourNow={derived.hourNow} units={units} />
            </div>
            <div className="col-side">
              <DailyForecast daily={weather.daily} currentTemp={weather.current.temperature_2m} units={units} />
            </div>
          </div>
        </main>
      )}

      <footer className="footer">
        Weather data by{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        {weather && ` · Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
      </footer>
    </div>
  );
}

function Skeleton() {
  return (
    <main className="content skeleton" aria-busy="true" aria-label="Loading weather">
      <div className="sk sk-hero" />
      <div className="grid">
        <div className="col-main">
          <div className="sk sk-card" />
          <div className="details">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="sk sk-tile" />
            ))}
          </div>
        </div>
        <div className="col-side">
          <div className="sk sk-tall" />
        </div>
      </div>
    </main>
  );
}
