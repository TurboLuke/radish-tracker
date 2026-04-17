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

## Deployment (Vercel + Upstash Redis, free)

This project now uses **Upstash Redis** as its database — it's free for small apps and integrates with Vercel in one click.

### Steps

1. **Push this repo to GitHub.**
2. **Import it in Vercel** (vercel.com → Add New → Project → pick your repo).
3. On first deploy you'll get build errors until you add a database — that's expected.
4. In the Vercel dashboard, go to your project → **Storage** tab → **Create Database** → **Upstash → Redis** → pick the free plan.
5. Vercel automatically injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into your project's environment variables.
6. **Redeploy** (the Deployments tab → "…" → Redeploy). Done.

### Local development

Copy `.env.local.example` to `.env.local` and fill in the values from your Upstash dashboard (Upstash → your DB → REST API tab). Then:

```bash
npm install
npm run dev
```

### How the storage works

The API uses a single Redis list at the key `radis:sightings`:
- `GET /api/sightings` → `LRANGE 0 -1` returns all pins
- `POST /api/sightings` → `RPUSH` appends a new pin

The Upstash free tier gives you 500,000 commands/month and 256 MB, which is thousands of radishes before you'd ever worry.

### Other options

If you prefer a real database with a UI:
- **Neon** (Postgres, free tier) — good if you want to browse/edit rows in a web UI
- **Turso** (SQLite at the edge, free tier) — nice if you like SQL
- **Supabase** (Postgres + dashboard, free tier) — same, with more batteries included

All three are available in the Vercel Marketplace with the same one-click integration.

## Customizing

- **Bounding box**: edit `RENNES_BOUNDS` in both `app/api/sightings/route.ts` and `components/MapView.tsx`.
- **Map style**: swap the `TileLayer` URL in `MapView.tsx`. Try `https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png` for a warmer look.
- **The radish itself**: it's an inline SVG inside `MapView.tsx` — tweak the `<path>` colors or shape there.

Enjoy the harvest 🌱
