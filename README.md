# SkyCast

A modern weather app built with React and Vite, using data from [Open-Meteo](https://open-meteo.com/) (free, no API key).

## Features
- City search with autocomplete, plus "use my location"
- Favourite cities, °C/°F toggle (both saved in the browser)
- Live animated sky that matches the conditions: rain, snow, lightning, fog, drifting clouds, stars and shooting stars at night
- Theme gradients that change with the weather and time of day
- 24-hour forecast with a smooth temperature curve and rain chance
- 10-day forecast with temperature range bars; tap a day for details
- Wind compass, sunrise/sunset arc, air quality, UV, feels like, humidity, pressure trend, visibility
- Plain-language insight ("Rain likely around 3 PM") and a live local clock for the searched city
- Auto-refresh every 10 minutes, responsive layout, respects reduced-motion settings

## Development
```bash
npm install
npm run dev      # start dev server
npm run build    # production build into build/
firebase deploy  # deploy (hosting serves build/)
```
