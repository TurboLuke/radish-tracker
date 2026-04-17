# 🌱 Veille aux Radis · Rennes

A simple, mobile-first web app to map radishes painted around Rennes by your favorite local street artist. Anyone can drop a pin — no login, no fuss. UI is in French.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Leaflet** + **CARTO Light** tiles for the map
- A plain **`data/sightings.json`** file as the database

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> on your phone (same Wi-Fi) or in a desktop browser with mobile emulation.

## How it works

- **Map**: locked to the Rennes bounding box (zoom 12–18), so users can't wander off.
- **Add a sighting**: tap *"Spotted a radish"* → drag the map until the radish crosshair sits where the artwork is → tap *"Pin here"* → add your name and a note → *"Plant the pin"*.
- **Storage**: a POST to `/api/sightings` appends to `data/sightings.json`. A GET reads it back. The API also validates that coordinates fall within Rennes.

## File structure

```
app/
  api/sightings/route.ts   # GET + POST handlers
  globals.css              # All styling (no Tailwind)
  layout.tsx
  page.tsx                 # Main UI / sheet logic
components/
  MapView.tsx              # Leaflet map + custom radish marker
data/
  sightings.json           # Your "database"
```

## Deployment notes

The JSON file approach works locally and on a single long-running Node server (e.g. a small VPS, Railway, Render, Fly.io). 

⚠️ **Vercel / Netlify won't persist the JSON file** between deploys (and serverless functions have read-only filesystems). If you deploy there, swap the file I/O in `app/api/sightings/route.ts` for a small KV store like:
- **Vercel KV** / **Upstash Redis** (free tier works fine)
- **Turso** / **Neon** (SQLite/Postgres)
- A **GitHub Gist** as a poor-man's database

The data shape is so small that any of these is a 10-line swap.

## Customizing

- **Bounding box**: edit `RENNES_BOUNDS` in both `app/api/sightings/route.ts` and `components/MapView.tsx`.
- **Map style**: swap the `TileLayer` URL in `MapView.tsx`. Try `https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png` for a warmer look.
- **The radish itself**: it's an inline SVG inside `MapView.tsx` — tweak the `<path>` colors or shape there.

Enjoy the harvest 🌱
