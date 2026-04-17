'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Sighting } from '@/components/MapView';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="loading">
      <div className="loading-radish">radis.</div>
      <div className="loading-text">on prépare le potager…</div>
    </div>
  ),
});

export default function HomePage() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 48.1173,
    lng: -1.6778,
  });
  const [showSheet, setShowSheet] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [note, setNote] = useState('');
  const [spotter, setSpotter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2700);
  };

  const fetchSightings = useCallback(async () => {
    try {
      const res = await fetch('/api/sightings', { cache: 'no-store' });
      const data = await res.json();
      setSightings(data.sightings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  const handleStartPlacing = () => {
    setPlacing(true);
    showToast('Déplacez la carte pour placer le radis');
  };

  const handleConfirmLocation = () => {
    setPinCoords({ lat: center.lat, lng: center.lng });
    setShowSheet(true);
  };

  const handleCancelPlacing = () => {
    setPlacing(false);
    setPinCoords(null);
    setShowSheet(false);
    setNote('');
    setSpotter('');
  };

  const handleSubmit = async () => {
    if (!pinCoords) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: pinCoords.lat,
          lng: pinCoords.lng,
          note: note.trim(),
          spotter: spotter.trim() || 'Anonyme',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Échec');
      }
      const data = await res.json();
      setSightings((prev) => [...prev, data.sighting]);
      handleCancelPlacing();
      showToast('Radis repéré 🌱');
    } catch (e: any) {
      showToast(e.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div>
              <div>
                <span className="logo-mark">veille</span>
                <span className="logo-text">·aux radis</span>
              </div>
              <span className="logo-sub">une carte d'art de rue · Rennes</span>
            </div>
          </div>
          <div className="count-badge">
            <strong>{sightings.length}</strong> repérés
          </div>
        </div>
      </header>

      <div className="map-wrap">
        <MapView sightings={sightings} onCenter={(lat, lng) => setCenter({ lat, lng })} />
        {placing && !showSheet && (
          <>
            <div className="crosshair-dot" />
            <div className="crosshair">
              <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
                <defs>
                  <radialGradient id="topGradC" cx="0.35" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor="#f06595"/>
                    <stop offset="60%" stopColor="#d6336c"/>
                    <stop offset="100%" stopColor="#a31d4f"/>
                  </radialGradient>
                  <radialGradient id="bottomGradC" cx="0.5" cy="0.3" r="0.7">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="70%" stopColor="#f5eee4"/>
                    <stop offset="100%" stopColor="#e4d9c2"/>
                  </radialGradient>
                  <linearGradient id="blendGradC" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#d6336c" stopOpacity="0"/>
                    <stop offset="40%" stopColor="#e05989" stopOpacity="0.6"/>
                    <stop offset="70%" stopColor="#f5d4e0" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                  </linearGradient>
                  <clipPath id="radishShapeC">
                    <path d="M18 12 C9 12, 5 19, 6 27 C7 35, 13 44, 18 44 C23 44, 29 35, 30 27 C31 19, 27 12, 18 12 Z"/>
                  </clipPath>
                </defs>
                <g opacity="0.9">
                  <path d="M14 11 C10 4, 5 5, 6 10 C4 7, 1 10, 4 13 C7 11, 11 11, 14 12 Z" fill="#2f5d3a"/>
                  <path d="M22 11 C26 4, 31 5, 30 10 C32 7, 35 10, 32 13 C29 11, 25 11, 22 12 Z" fill="#2f5d3a"/>
                </g>
                <path d="M18 11 C15 5, 11 3, 11 8 C10 5, 7 6, 8 10 C11 10, 14 10, 17 11 Z" fill="#5a8f4f"/>
                <path d="M18 11 C21 5, 25 3, 25 8 C26 5, 29 6, 28 10 C25 10, 22 10, 19 11 Z" fill="#5a8f4f"/>
                <path d="M18 10 C17 6, 18 3, 18 0 C19 3, 18 6, 19 10 Z" fill="#2f5d3a"/>
                <g clipPath="url(#radishShapeC)">
                  <rect x="0" y="10" width="36" height="20" fill="url(#topGradC)"/>
                  <rect x="0" y="28" width="36" height="20" fill="url(#bottomGradC)"/>
                  <rect x="0" y="22" width="36" height="10" fill="url(#blendGradC)"/>
                  <ellipse cx="13" cy="18" rx="3" ry="4.5" fill="#ffffff" opacity="0.35"/>
                </g>
                <path d="M18 12 C9 12, 5 19, 6 27 C7 35, 13 44, 18 44 C23 44, 29 35, 30 27 C31 19, 27 12, 18 12 Z" stroke="#a31d4f" strokeWidth="0.5" fill="none" opacity="0.4"/>
                <path d="M18 44 Q18.5 46, 18 48 Q17.5 46, 18 44" fill="#e4d9c2" stroke="#c9b99a" strokeWidth="0.4"/>
              </svg>
            </div>
          </>
        )}
      </div>

      {!placing && (
        <div className="action-bar">
          <button className="fab radish" onClick={handleStartPlacing}>
            <svg className="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            J'ai vu un radis
          </button>
        </div>
      )}

      {placing && !showSheet && (
        <div className="action-bar">
          <div className="fab-group">
            <button className="fab-secondary" onClick={handleCancelPlacing}>
              Annuler
            </button>
            <button className="fab radish" onClick={handleConfirmLocation}>
              Planter ici
            </button>
          </div>
        </div>
      )}

      {showSheet && pinCoords && (
        <>
          <div className="sheet-backdrop" onClick={handleCancelPlacing} />
          <div className="sheet">
            <div className="sheet-handle" />
            <h2 className="sheet-title">
              Un nouveau <em>radis</em>
            </h2>
            <div className="sheet-sub">racontez-nous ce que vous avez vu</div>

            <div className="coords">
              <div>lat <span>{pinCoords.lat.toFixed(5)}</span></div>
              <div>lng <span>{pinCoords.lng.toFixed(5)}</span></div>
            </div>

            <div className="field">
              <label className="field-label">Votre nom (ou pseudo)</label>
              <input
                className="field-input"
                type="text"
                value={spotter}
                onChange={(e) => setSpotter(e.target.value.slice(0, 40))}
                placeholder="Anonyme"
                maxLength={40}
              />
            </div>

            <div className="field">
              <label className="field-label">Une note (facultatif)</label>
              <textarea
                className="field-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 280))}
                placeholder="Sur le mur derrière la boulangerie, un peu effacé…"
                maxLength={280}
              />
              <div className="field-counter">{note.length}/280</div>
            </div>

            <div className="sheet-actions">
              <button className="btn btn-ghost" onClick={handleCancelPlacing}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'On plante…' : 'Planter le radis'}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}

      {loading && (
        <div className="loading">
          <div className="loading-radish">radis.</div>
          <div className="loading-text">on prépare le potager…</div>
        </div>
      )}
    </div>
  );
}
