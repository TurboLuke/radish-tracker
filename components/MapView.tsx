'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

export type Sighting = {
  id: string;
  lat: number;
  lng: number;
  note: string;
  spotter: string;
  createdAt: string;
};

// Rennes city center
const RENNES_CENTER: [number, number] = [48.1173, -1.6778];
const RENNES_BOUNDS: [[number, number], [number, number]] = [
  [48.05, -1.78],
  [48.20, -1.55],
];

// Custom radish SVG marker - pink top, white bottom (French breakfast style)
const radishIcon = L.divIcon({
  className: 'radish-pin',
  html: `
    <svg class="radish-pin-svg" width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="topGrad" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stop-color="#f06595"/>
          <stop offset="60%" stop-color="#d6336c"/>
          <stop offset="100%" stop-color="#a31d4f"/>
        </radialGradient>
        <radialGradient id="bottomGrad" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#f5eee4"/>
          <stop offset="100%" stop-color="#e4d9c2"/>
        </radialGradient>
        <linearGradient id="blendGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#d6336c" stop-opacity="0"/>
          <stop offset="40%" stop-color="#e05989" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="#f5d4e0" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="radishShape">
          <path d="M18 12 C9 12, 5 19, 6 27 C7 35, 13 44, 18 44 C23 44, 29 35, 30 27 C31 19, 27 12, 18 12 Z"/>
        </clipPath>
      </defs>

      <!-- Back leaves -->
      <g opacity="0.95">
        <path d="M14 11 C10 4, 5 5, 6 10 C4 7, 1 10, 4 13 C7 11, 11 11, 14 12 Z" fill="#2f5d3a"/>
        <path d="M22 11 C26 4, 31 5, 30 10 C32 7, 35 10, 32 13 C29 11, 25 11, 22 12 Z" fill="#2f5d3a"/>
      </g>

      <!-- Front leaves -->
      <path d="M18 11 C15 5, 11 3, 11 8 C10 5, 7 6, 8 10 C11 10, 14 10, 17 11 Z" fill="#5a8f4f"/>
      <path d="M18 11 C21 5, 25 3, 25 8 C26 5, 29 6, 28 10 C25 10, 22 10, 19 11 Z" fill="#5a8f4f"/>
      <path d="M18 10 C17 6, 18 3, 18 0 C19 3, 18 6, 19 10 Z" fill="#2f5d3a"/>

      <!-- Radish body - pink top half -->
      <g clip-path="url(#radishShape)">
        <rect x="0" y="10" width="36" height="20" fill="url(#topGrad)"/>
        <!-- White bottom half -->
        <rect x="0" y="28" width="36" height="20" fill="url(#bottomGrad)"/>
        <!-- Blend zone between pink and white -->
        <rect x="0" y="22" width="36" height="10" fill="url(#blendGrad)"/>
        <!-- Highlight on pink -->
        <ellipse cx="13" cy="18" rx="3" ry="4.5" fill="#ffffff" opacity="0.35"/>
      </g>

      <!-- Outline for definition -->
      <path d="M18 12 C9 12, 5 19, 6 27 C7 35, 13 44, 18 44 C23 44, 29 35, 30 27 C31 19, 27 12, 18 12 Z" stroke="#a31d4f" stroke-width="0.5" fill="none" opacity="0.4"/>

      <!-- Root tail -->
      <path d="M18 44 Q18.5 46, 18 48 Q17.5 46, 18 44" fill="#e4d9c2" stroke="#c9b99a" stroke-width="0.4"/>
    </svg>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 46],
  popupAnchor: [0, -42],
});

function MapBoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(RENNES_BOUNDS);
    map.setMinZoom(12);
    map.setMaxZoom(18);
  }, [map]);
  return null;
}

function CenterReporter({ onCenter }: { onCenter: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      onCenter(c.lat, c.lng);
    };
    update();
    map.on('move', update);
    return () => {
      map.off('move', update);
    };
  }, [map, onCenter]);
  return null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function MapView({
  sightings,
  onCenter,
}: {
  sightings: Sighting[];
  onCenter: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={RENNES_CENTER}
      zoom={14}
      zoomControl={false}
      attributionControl={true}
      maxBounds={RENNES_BOUNDS}
      maxBoundsViscosity={1}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapBoundsEnforcer />
      <CenterReporter onCenter={onCenter} />
      {sightings.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={radishIcon}>
          <Popup>
            <div className="popup-spotter">{s.spotter}</div>
            {s.note && <div className="popup-note">«&nbsp;{s.note}&nbsp;»</div>}
            <div className="popup-meta">repéré · {formatDate(s.createdAt)}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
