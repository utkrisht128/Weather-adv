import { useEffect, useState } from "react";
import WeatherIcon from "./WeatherIcon";
import { StarIcon } from "./Icons";
import { describe } from "../lib/weatherCodes";
import { clockLabel, temp, toF } from "../lib/format";

// Animate the big temperature number when it changes.
function useCountUp(target, ms = 900) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (target == null) return;
    let raf;
    const from = value ?? target;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

function useLocalClock(offsetSeconds) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return new Date(now + offsetSeconds * 1000);
}

export default function Hero({ place, weather, units, insight, isFavorite, onToggleFavorite }) {
  const { current, daily, utc_offset_seconds } = weather;
  const { label, scene } = describe(current.weather_code);
  const shown = units === "F" ? toF(current.temperature_2m) : current.temperature_2m;
  const animated = useCountUp(shown);
  const local = useLocalClock(utc_offset_seconds);
  const dateLabel = local.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <section className="hero fade-up">
      <div className="hero-place">
        <h1>
          {place.name}
          <button
            className={`fav-btn${isFavorite ? " on" : ""}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <StarIcon filled={isFavorite} />
          </button>
        </h1>
        {place.region && <p className="region">{place.region}</p>}
        <p className="clock">
          {dateLabel} · <span className="time">{clockLabel(local)}</span>
        </p>
      </div>

      <div className="hero-main">
        <WeatherIcon scene={scene} isDay={!!current.is_day} size={148} className="hero-icon" />
        <div className="hero-temp">
          <span className="big">{Math.round(animated)}</span>
          <span className="deg">°{units}</span>
        </div>
      </div>

      <p className="condition">{label}</p>
      <p className="hilo">
        H: {temp(daily.temperature_2m_max[0], units)} &nbsp; L: {temp(daily.temperature_2m_min[0], units)} &nbsp;·&nbsp;
        Feels like {temp(current.apparent_temperature, units)}
      </p>
      {insight && <p className="insight glass">{insight}</p>}
    </section>
  );
}
