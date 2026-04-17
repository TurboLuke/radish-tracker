import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv(); // reads KV_REST_API_URL + KV_REST_API_TOKEN automatically

const SIGHTINGS_KEY = 'radis:sightings';

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

export async function GET() {
  // lrange 0 -1 = get all items in the list
  const items = await redis.lrange<Sighting>(SIGHTINGS_KEY, 0, -1);
  return NextResponse.json({ sightings: items });
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

    const sighting: Sighting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lat,
      lng,
      note: (note || '').toString().slice(0, 280),
      spotter: (spotter || 'Anonyme').toString().slice(0, 40) || 'Anonyme',
      createdAt: new Date().toISOString(),
    };

    // rpush = append to the end of the list
    await redis.rpush(SIGHTINGS_KEY, sighting);

    return NextResponse.json({ sighting });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
