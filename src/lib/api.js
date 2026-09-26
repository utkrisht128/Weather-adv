const FORECAST = "https://api.open-meteo.com/v1/forecast";
const AIR = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE = "https://api.bigdatacloud.net/data/reverse-geocode-client";

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function searchPlaces(query, signal) {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({ name: query.trim(), count: "6", language: "en" });
  const json = await getJson(`${GEO}?${params}`, signal);
  return (json.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(", "),
    country: r.country_code,
    lat: r.latitude,
    lon: r.longitude,
  }));
}

export async function reverseGeocode(lat, lon) {
  try {
    const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: "en" });
    const json = await getJson(`${REVERSE}?${params}`);
    return {
      name: json.city || json.locality || "My location",
      region: [json.principalSubdivision, json.countryName].filter(Boolean).join(", "),
      country: json.countryCode,
    };
  } catch {
    return { name: "My location", region: "", country: "" };
  }
}

export async function fetchWeather({ lat, lon }, signal) {
  const forecast = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: "auto",
    forecast_days: "10",
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day",
      "precipitation", "weather_code", "cloud_cover", "pressure_msl",
      "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m", "weather_code", "precipitation_probability", "is_day",
      "visibility", "dew_point_2m", "uv_index", "pressure_msl",
    ].join(","),
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset",
      "uv_index_max", "precipitation_probability_max", "precipitation_sum",
      "wind_speed_10m_max", "daylight_duration",
    ].join(","),
  });
  const air = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: "auto",
    current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide",
  });

  const [weather, airQuality] = await Promise.all([
    getJson(`${FORECAST}?${forecast}`, signal),
    // Air quality is optional; don't fail the whole view if it's unavailable.
    getJson(`${AIR}?${air}`, signal).catch((e) => {
      if (e.name === "AbortError") throw e;
      return null;
    }),
  ]);
  return { ...weather, air: airQuality?.current ?? null };
}
