import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'sightings.json');

// Rennes bounding box (rough) — keep pins in/near Rennes
const RENNES_BOUNDS = {
  minLat: 48.05,
  maxLat: 48.20,
  minLng: -1.78,
  maxLng: -1.55,
};

type Sighting = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  spotter: string;
  createdAt: string;
};

async function readSightings(): Promise<{ sightings: Sighting[] }> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { sightings: [] };
  }
}

async function writeSightings(data: { sightings: Sighting[] }) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = await readSightings();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng, note, spotter } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 });
    }

    if (
      lat < RENNES_BOUNDS.minLat ||
      lat > RENNES_BOUNDS.maxLat ||
      lng < RENNES_BOUNDS.minLng ||
      lng > RENNES_BOUNDS.maxLng
    ) {
      return NextResponse.json(
        { error: 'Les radis doivent être dans Rennes' },
        { status: 400 }
      );
    }

    const data = await readSightings();
    const sighting: Sighting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lat,
      lng,
      note: (note || '').toString().slice(0, 280),
      spotter: (spotter || 'Anonyme').toString().slice(0, 40) || 'Anonyme',
      createdAt: new Date().toISOString(),
    };

    data.sightings.push(sighting);
    await writeSightings(data);

    return NextResponse.json({ sighting });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
