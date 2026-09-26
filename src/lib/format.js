export const toF = (c) => (c * 9) / 5 + 32;

export function temp(c, units) {
  if (c == null) return "–";
  return `${Math.round(units === "F" ? toF(c) : c)}°`;
}

export function speed(kmh, units) {
  if (kmh == null) return "–";
  return units === "F" ? `${Math.round(kmh * 0.621)} mph` : `${Math.round(kmh)} km/h`;
}

export function distance(m, units) {
  if (m == null) return "–";
  if (units === "F") return `${(m / 1609).toFixed(m < 16090 ? 1 : 0)} mi`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

export function precip(mm, units) {
  if (mm == null) return "–";
  return units === "F" ? `${(mm / 25.4).toFixed(2)} in` : `${mm.toFixed(1)} mm`;
}

// Open-Meteo returns local wall-clock times like "2026-09-26T14:00" when timezone=auto.
// Parse them as UTC so formatting with timeZone "UTC" shows the location's local time.
export const parseLocal = (s) => new Date(`${s.length === 10 ? s + "T00:00" : s}:00Z`);

export function hourLabel(s) {
  return parseLocal(s).toLocaleTimeString([], { hour: "numeric", timeZone: "UTC" });
}

export function clockLabel(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export function dayLabel(s, index) {
  if (index === 0) return "Today";
  return parseLocal(s).toLocaleDateString([], { weekday: "short", timeZone: "UTC" });
}

export function compass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function uvLevel(uv) {
  if (uv < 3) return ["Low", "Minimal protection needed."];
  if (uv < 6) return ["Moderate", "Wear sunscreen at midday."];
  if (uv < 8) return ["High", "Seek shade during midday hours."];
  if (uv < 11) return ["Very high", "Avoid sun between 11am–4pm."];
  return ["Extreme", "Stay indoors if possible."];
}

export function aqiLevel(aqi) {
  if (aqi <= 50) return ["Good", "Air quality is satisfactory.", "#4ade80"];
  if (aqi <= 100) return ["Moderate", "Acceptable for most people.", "#facc15"];
  if (aqi <= 150) return ["Unhealthy (sensitive)", "Sensitive groups should limit outdoor exertion.", "#fb923c"];
  if (aqi <= 200) return ["Unhealthy", "Everyone may begin to feel effects.", "#f87171"];
  if (aqi <= 300) return ["Very unhealthy", "Health alert: avoid outdoor activity.", "#c084fc"];
  return ["Hazardous", "Emergency conditions.", "#be123c"];
}
