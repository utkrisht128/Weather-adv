import { useState } from "react";
import WeatherIcon from "./WeatherIcon";
import { CalendarIcon } from "./Icons";
import { describe } from "../lib/weatherCodes";
import { clockLabel, dayLabel, parseLocal, precip, speed, temp } from "../lib/format";

// Map a °C value onto a cold→hot colour so range bars show at a glance how warm a day is.
function tempColor(c) {
  const stops = [
    [-10, [129, 140, 248]],
    [5, [96, 165, 250]],
    [15, [74, 222, 128]],
    [25, [250, 204, 21]],
    [35, [249, 115, 22]],
    [45, [239, 68, 68]],
  ];
  if (c <= stops[0][0]) return `rgb(${stops[0][1]})`;
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i];
    const [t0, c0] = stops[i - 1];
    if (c <= t1) {
      const p = (c - t0) / (t1 - t0);
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * p))})`;
    }
  }
  return `rgb(${stops[stops.length - 1][1]})`;
}

export default function DailyForecast({ daily, currentTemp, units }) {
  const [open, setOpen] = useState(null);
  const lo = Math.min(...daily.temperature_2m_min);
  const hi = Math.max(...daily.temperature_2m_max);
  const span = hi - lo || 1;
  const pct = (t) => ((t - lo) / span) * 100;

  return (
    <section className="card glass daily fade-up" style={{ "--d": "160ms" }}>
      <h2 className="card-title">
        <CalendarIcon /> {daily.time.length}-day forecast
      </h2>
      <ul>
        {daily.time.map((day, i) => {
          const min = daily.temperature_2m_min[i];
          const max = daily.temperature_2m_max[i];
          const { label, scene } = describe(daily.weather_code[i]);
          const pop = daily.precipitation_probability_max[i];
          const expanded = open === i;
          return (
            <li key={day} className={expanded ? "expanded" : ""} style={{ "--i": i }}>
              <button className="day-row" onClick={() => setOpen(expanded ? null : i)} aria-expanded={expanded}>
                <span className="day-name">{dayLabel(day, i)}</span>
                <span className="day-icon">
                  <WeatherIcon scene={scene} size={32} />
                  {pop >= 20 && <span className="day-pop">{pop}%</span>}
                </span>
                <span className="day-lo">{temp(min, units)}</span>
                <span className="range">
                  <span
                    className="range-fill"
                    style={{
                      left: `${pct(min)}%`,
                      right: `${100 - pct(max)}%`,
                      background: `linear-gradient(90deg, ${tempColor(min)}, ${tempColor(max)})`,
                    }}
                  />
                  {i === 0 && currentTemp != null && (
                    <span className="range-now" style={{ left: `${pct(Math.min(Math.max(currentTemp, min), max))}%` }} />
                  )}
                </span>
                <span className="day-hi">{temp(max, units)}</span>
              </button>
              {expanded && (
                <div className="day-details">
                  <div>
                    <span>Conditions</span>
                    <b>{label}</b>
                  </div>
                  <div>
                    <span>Rain chance</span>
                    <b>{pop ?? 0}%</b>
                  </div>
                  <div>
                    <span>Precipitation</span>
                    <b>{precip(daily.precipitation_sum[i], units)}</b>
                  </div>
                  <div>
                    <span>Max wind</span>
                    <b>{speed(daily.wind_speed_10m_max[i], units)}</b>
                  </div>
                  <div>
                    <span>UV index</span>
                    <b>{Math.round(daily.uv_index_max[i] ?? 0)}</b>
                  </div>
                  <div>
                    <span>Sunrise / Sunset</span>
                    <b>
                      {clockLabel(parseLocal(daily.sunrise[i]))} / {clockLabel(parseLocal(daily.sunset[i]))}
                    </b>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
