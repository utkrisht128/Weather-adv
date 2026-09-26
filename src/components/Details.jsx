import {
  DropIcon, EyeIcon, GaugeIcon, LeafIcon, SunIcon, SunriseIcon, ThermoIcon, UmbrellaIcon, WindIcon,
} from "./Icons";
import {
  aqiLevel, clockLabel, compass, distance, parseLocal, precip, speed, temp, uvLevel,
} from "../lib/format";

function Tile({ icon, title, children, className = "", i }) {
  return (
    <div className={`tile glass fade-up ${className}`} style={{ "--d": `${200 + i * 60}ms` }}>
      <h3 className="card-title">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Meter({ value, max, gradient }) {
  const p = Math.max(0, Math.min(value / max, 1)) * 100;
  return (
    <div className="meter" style={{ background: gradient }}>
      <span style={{ left: `${p}%` }} />
    </div>
  );
}

function WindTile({ current, units, i }) {
  const dir = current.wind_direction_10m;
  return (
    <Tile icon={<WindIcon />} title="Wind" className="wind" i={i}>
      <div className="wind-body">
        <svg viewBox="0 0 120 120" className="compass" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="ring" />
          {Array.from({ length: 72 }, (_, k) => (
            <line
              key={k}
              x1="60"
              y1="10"
              x2="60"
              y2={k % 18 === 0 ? 18 : 14}
              className={k % 18 === 0 ? "tick major" : "tick"}
              transform={`rotate(${k * 5} 60 60)`}
            />
          ))}
          {["N", "E", "S", "W"].map((l, k) => {
            const a = (k * Math.PI) / 2;
            return (
              <text key={l} x={60 + Math.sin(a) * 34} y={60 - Math.cos(a) * 34 + 4} textAnchor="middle">
                {l}
              </text>
            );
          })}
          {/* The arrow points where the wind blows to, i.e. away from its source direction. */}
          <g className="needle" style={{ transform: `rotate(${dir + 180}deg)` }}>
            <path d="M60 16 L66 30 L60 27 L54 30 Z" />
            <line x1="60" y1="27" x2="60" y2="96" />
            <circle cx="60" cy="96" r="3.5" />
          </g>
        </svg>
        <div className="wind-stats">
          <div>
            <b>{speed(current.wind_speed_10m, units)}</b>
            <span>Wind</span>
          </div>
          <div>
            <b>{speed(current.wind_gusts_10m, units)}</b>
            <span>Gusts</span>
          </div>
          <div>
            <b>
              {compass(dir)} {Math.round(dir)}°
            </b>
            <span>Direction</span>
          </div>
        </div>
      </div>
    </Tile>
  );
}

function SunTile({ daily, weather, i }) {
  const rise = parseLocal(daily.sunrise[0]);
  const set = parseLocal(daily.sunset[0]);
  const now = parseLocal(weather.current.time);
  const p = Math.max(0, Math.min((now - rise) / (set - rise), 1));
  const up = now >= rise && now <= set;
  // Sun position on a half-ellipse arc.
  const angle = Math.PI * (1 - p);
  const sx = 100 + Math.cos(angle) * 80;
  const sy = 80 - Math.sin(angle) * 60;
  const hours = Math.floor(daily.daylight_duration[0] / 3600);
  const mins = Math.round((daily.daylight_duration[0] % 3600) / 60);
  return (
    <Tile icon={<SunriseIcon />} title="Sun" className="sun" i={i}>
      <svg viewBox="0 0 200 96" className="sun-arc" aria-hidden="true">
        <defs>
          <linearGradient id="arcGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#ffb86b" />
            <stop offset="0.5" stopColor="#ffe28a" />
            <stop offset="1" stopColor="#ff8a65" />
          </linearGradient>
        </defs>
        <path d="M20 80 A80 60 0 0 1 180 80" className="arc-bg" />
        <path
          d="M20 80 A80 60 0 0 1 180 80"
          className="arc-done"
          pathLength="1"
          style={{ strokeDasharray: `${p} 1` }}
        />
        <line x1="8" x2="192" y1="80" y2="80" className="horizon" />
        {up && <circle cx={sx} cy={sy} r="7" className="sun-dot" />}
      </svg>
      <div className="sun-times">
        <div>
          <span>Sunrise</span>
          <b>{clockLabel(rise)}</b>
        </div>
        <div className="center">
          <span>Daylight</span>
          <b>
            {hours}h {mins}m
          </b>
        </div>
        <div className="right">
          <span>Sunset</span>
          <b>{clockLabel(set)}</b>
        </div>
      </div>
    </Tile>
  );
}

export default function Details({ weather, hourNow, units }) {
  const { current, daily, air } = weather;
  const uv = hourNow.uv ?? 0;
  const [uvText, uvTip] = uvLevel(uv);
  const feelsDiff = current.apparent_temperature - current.temperature_2m;
  const pressureTrend = hourNow.pressureIn3h - current.pressure_msl;

  let i = 0;
  return (
    <div className="details">
      <WindTile current={current} units={units} i={i++} />
      <SunTile daily={daily} weather={weather} i={i++} />

      {air && (
        <Tile icon={<LeafIcon />} title="Air quality" i={i++}>
          {(() => {
            const [label, tip, color] = aqiLevel(air.us_aqi);
            return (
              <>
                <p className="tile-value">
                  {Math.round(air.us_aqi)} <small style={{ color }}>{label}</small>
                </p>
                <Meter
                  value={air.us_aqi}
                  max={300}
                  gradient="linear-gradient(90deg,#4ade80,#facc15,#fb923c,#f87171,#c084fc,#be123c)"
                />
                <p className="tile-tip">{tip}</p>
                <div className="pollutants">
                  <span>PM2.5 <b>{Math.round(air.pm2_5)}</b></span>
                  <span>PM10 <b>{Math.round(air.pm10)}</b></span>
                  <span>O₃ <b>{Math.round(air.ozone)}</b></span>
                  <span>NO₂ <b>{Math.round(air.nitrogen_dioxide)}</b></span>
                </div>
              </>
            );
          })()}
        </Tile>
      )}

      <Tile icon={<SunIcon />} title="UV index" i={i++}>
        <p className="tile-value">
          {Math.round(uv)} <small>{uvText}</small>
        </p>
        <Meter value={uv} max={11} gradient="linear-gradient(90deg,#4ade80,#facc15,#fb923c,#ef4444,#a855f7)" />
        <p className="tile-tip">{uvTip}</p>
      </Tile>

      <Tile icon={<ThermoIcon />} title="Feels like" i={i++}>
        <p className="tile-value">{temp(current.apparent_temperature, units)}</p>
        <p className="tile-tip">
          {Math.abs(feelsDiff) < 1.5
            ? "Similar to the actual temperature."
            : feelsDiff > 0
              ? "Humidity is making it feel warmer."
              : "Wind is making it feel colder."}
        </p>
      </Tile>

      <Tile icon={<DropIcon />} title="Humidity" i={i++}>
        <p className="tile-value">{current.relative_humidity_2m}%</p>
        <div className="bar">
          <span style={{ width: `${current.relative_humidity_2m}%` }} />
        </div>
        <p className="tile-tip">The dew point is {temp(hourNow.dewPoint, units)} right now.</p>
      </Tile>

      <Tile icon={<UmbrellaIcon />} title="Precipitation" i={i++}>
        <p className="tile-value">{precip(daily.precipitation_sum[0], units)}</p>
        <p className="tile-tip">
          Expected today. {daily.precipitation_probability_max[1] ?? 0}% chance tomorrow
          ({precip(daily.precipitation_sum[1], units)}).
        </p>
      </Tile>

      <Tile icon={<GaugeIcon />} title="Pressure" i={i++}>
        <p className="tile-value">
          {Math.round(current.pressure_msl)} <small>hPa</small>
        </p>
        <p className="tile-tip">
          {Math.abs(pressureTrend) < 1
            ? "Steady over the next 3 hours."
            : pressureTrend > 0
              ? "Rising — conditions may improve."
              : "Falling — unsettled weather possible."}
        </p>
      </Tile>

      <Tile icon={<EyeIcon />} title="Visibility" i={i++}>
        <p className="tile-value">{distance(hourNow.visibility, units)}</p>
        <p className="tile-tip">
          {hourNow.visibility >= 10000
            ? "Perfectly clear view."
            : hourNow.visibility >= 4000
              ? "Light haze is reducing visibility."
              : "Low visibility — take care on the roads."}
        </p>
      </Tile>
    </div>
  );
}
