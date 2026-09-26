// WMO weather interpretation codes → label + scene type used for icons, theme and animation.
const CODES = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"],
  48: ["Freezing fog", "fog"],
  51: ["Light drizzle", "drizzle"],
  53: ["Drizzle", "drizzle"],
  55: ["Heavy drizzle", "drizzle"],
  56: ["Freezing drizzle", "drizzle"],
  57: ["Freezing drizzle", "drizzle"],
  61: ["Light rain", "rain"],
  63: ["Rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"],
  67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"],
  73: ["Snow", "snow"],
  75: ["Heavy snow", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Rain showers", "rain"],
  81: ["Rain showers", "rain"],
  82: ["Violent showers", "rain"],
  85: ["Snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm, hail", "storm"],
  99: ["Severe thunderstorm", "storm"],
};

export function describe(code) {
  const [label, scene] = CODES[code] ?? ["Unknown", "cloudy"];
  return { label, scene };
}

// How heavy precipitation is, 0–1, for scaling particle counts.
export function intensity(code) {
  if ([55, 65, 67, 75, 82, 86, 99].includes(code)) return 1;
  if ([53, 63, 73, 81, 95, 96].includes(code)) return 0.65;
  return 0.35;
}
