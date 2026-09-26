import WeatherIcon from "./WeatherIcon";
import { ClockIcon } from "./Icons";
import { describe } from "../lib/weatherCodes";
import { hourLabel, temp, toF } from "../lib/format";

const COL = 68;
const CHART_H = 96;
const PAD = 26;

// Catmull-Rom → cubic Bézier for a smooth curve through every point.
function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1] ?? pts[i];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = pts[i + 2] ?? pts[i + 1];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
  }
  return d;
}

export default function HourlyForecast({ hours, units }) {
  const temps = hours.map((h) => (units === "F" ? toF(h.temp) : h.temp));
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;
  const width = hours.length * COL;
  const pts = temps.map((t, i) => [i * COL + COL / 2, PAD + (1 - (t - min) / span) * (CHART_H - PAD * 1.6)]);
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]},${CHART_H} L${pts[0][0]},${CHART_H} Z`;

  return (
    <section className="card glass hourly fade-up" style={{ "--d": "80ms" }}>
      <h2 className="card-title">
        <ClockIcon /> 24-hour forecast
      </h2>
      <div className="hourly-scroll">
        <div className="hourly-track" style={{ width }}>
          <div className="hourly-row">
            {hours.map((h, i) => (
              <div key={h.time} className="hour" style={{ width: COL }}>
                <span className="hour-time">{i === 0 ? "Now" : hourLabel(h.time)}</span>
                <WeatherIcon scene={describe(h.code).scene} isDay={!!h.isDay} size={34} />
              </div>
            ))}
          </div>
          <svg className="hourly-chart" width={width} height={CHART_H} aria-hidden="true">
            <defs>
              <linearGradient id="tempFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ffd27a" stopOpacity="0.45" />
                <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="tempLine" x1="0" x2="1">
                <stop offset="0" stopColor="#ffe6a8" />
                <stop offset="1" stopColor="#ff9f6b" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#tempFill)" />
            <path d={line} fill="none" stroke="url(#tempLine)" strokeWidth="2.5" className="draw-line" />
            {pts.map(([x, y], i) => (
              <g key={hours[i].time}>
                <circle cx={x} cy={y} r={i === 0 ? 4.5 : 2.5} className={i === 0 ? "now-dot" : "dot"} />
                <text x={x} y={y - 10} textAnchor="middle" className="chart-temp">
                  {temp(hours[i].temp, units)}
                </text>
              </g>
            ))}
          </svg>
          <div className="hourly-row">
            {hours.map((h) => (
              <div key={h.time} className="hour" style={{ width: COL }}>
                <span className={`hour-rain${h.pop >= 30 ? " wet" : ""}`}>
                  <span className="rain-bar" style={{ "--p": `${h.pop ?? 0}%` }} />
                  {h.pop ?? 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
