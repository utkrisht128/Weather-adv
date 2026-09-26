const CLOUD = "M18 44h28a9 9 0 0 0 1-18 13 13 0 0 0-25-4 10 10 0 0 0-4 22z";

function Sun({ cx = 32, cy = 32, r = 11 }) {
  return (
    <g className="wi-sun">
      <g className="wi-rays" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy - r - 4}
            x2={cx}
            y2={cy - r - 9}
            transform={`rotate(${i * 45} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} />
    </g>
  );
}

function Moon({ x = 0, y = 0, s = 1 }) {
  return (
    <path
      className="wi-moon"
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M38 14a17 17 0 1 0 12 28 13.5 13.5 0 0 1-12-28z"
    />
  );
}

function Cloud({ dark, x = 0, y = 0, s = 1, back }) {
  return (
    <path
      className={`wi-cloud${dark ? " dark" : ""}${back ? " back" : ""}`}
      transform={`translate(${x} ${y}) scale(${s})`}
      d={CLOUD}
    />
  );
}

function Drops({ count, snow }) {
  const xs = count === 3 ? [24, 32, 40] : [22, 30, 38, 46];
  return (
    <g className={snow ? "wi-snow" : "wi-rain"}>
      {xs.map((x, i) =>
        snow ? (
          <circle key={x} cx={x} cy={46} r={2} style={{ animationDelay: `${i * 0.35}s` }} />
        ) : (
          <line key={x} x1={x} y1={44} x2={x - 2} y2={50} style={{ animationDelay: `${i * 0.25}s` }} />
        )
      )}
    </g>
  );
}

function Body({ scene, isDay }) {
  switch (scene) {
    case "clear":
      return isDay ? <Sun /> : <Moon x={-4} y={2} />;
    case "partly":
      return (
        <>
          {isDay ? <Sun cx={24} cy={24} r={8} /> : <Moon x={-12} y={-6} s={0.8} />}
          <Cloud x={4} y={4} />
        </>
      );
    case "cloudy":
      return (
        <>
          <Cloud back x={-8} y={-8} s={0.85} />
          <Cloud x={2} y={2} />
        </>
      );
    case "fog":
      return (
        <>
          <Cloud y={-8} />
          <g className="wi-fog">
            <line x1={14} y1={46} x2={50} y2={46} />
            <line x1={18} y1={52} x2={46} y2={52} />
          </g>
        </>
      );
    case "drizzle":
      return (
        <>
          <Cloud y={-8} />
          <Drops count={3} />
        </>
      );
    case "rain":
      return (
        <>
          <Cloud y={-8} />
          <Drops count={4} />
        </>
      );
    case "snow":
      return (
        <>
          <Cloud y={-8} />
          <Drops count={3} snow />
        </>
      );
    case "storm":
      return (
        <>
          <Cloud dark y={-8} />
          <path className="wi-bolt" d="M33 38l-6 10h5l-3 9 9-12h-5l3-7z" />
        </>
      );
    default:
      return <Cloud />;
  }
}

// Animated SVG weather icon; motion is defined in styles.css under .wicon.
export default function WeatherIcon({ scene, isDay = true, size = 48, className = "" }) {
  return (
    <svg className={`wicon ${className}`} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <Body scene={scene} isDay={isDay} />
    </svg>
  );
}
