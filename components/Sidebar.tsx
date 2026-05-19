"use client";

import { useMemo } from "react";
import type { SmokingSpot, SpotKind } from "@/data/spots";
import { CITIES } from "@/data/spots";
import { formatDistance, formatDuration } from "@/lib/routing";

type Filter = "all" | SpotKind;

interface SidebarProps {
  spots: SmokingSpot[];
  query: string;
  setQuery: (v: string) => void;
  filter: Filter;
  setFilter: (v: Filter) => void;
  city: string;
  setCity: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;

  userLocation: { lat: number; lng: number } | null;
  locating: boolean;
  locateError: string | null;
  onLocate: () => void;

  routeTo: SmokingSpot | null;
  routeLoading: boolean;
  routeError: string | null;
  routeDistance: number | null;
  routeDuration: number | null;
  onRoute: (spot: SmokingSpot) => void;
  onClearRoute: () => void;
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default function Sidebar(props: SidebarProps) {
  const {
    spots,
    query,
    setQuery,
    filter,
    setFilter,
    city,
    setCity,
    selectedId,
    onSelect,
    userLocation,
    locating,
    locateError,
    onLocate,
    routeTo,
    routeLoading,
    routeError,
    routeDistance,
    routeDuration,
    onRoute,
    onClearRoute,
  } = props;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = spots.filter((s) => {
      if (filter !== "all" && s.kind !== filter) return false;
      if (city !== "all" && s.city !== city) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nameJa?.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
    if (userLocation) {
      list = [...list].sort(
        (a, b) =>
          haversineKm(userLocation, a) - haversineKm(userLocation, b),
      );
    }
    return list;
  }, [spots, query, filter, city, userLocation]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-ash bg-white sm:w-[380px]">
      <div className="space-y-3 border-b border-ash p-4">
        <div>
          <h1 className="text-lg font-bold text-ink">
            🇯🇵 Japan Smoking Map
          </h1>
          <p className="text-xs text-smoke">
            Sigara alanları, sigara içilebilen kafeler ve yürüyüş rotaları.
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Yer, semt veya isim ara..."
          className="w-full rounded-md border border-ash bg-white px-3 py-2 text-sm focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
        />

        <div className="flex gap-2 text-xs">
          {(
            [
              ["all", "Hepsi"],
              ["area", "🚬 Alan"],
              ["cafe", "☕ Kafe"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`flex-1 rounded-md border px-2 py-1.5 ${
                filter === k
                  ? "border-ember bg-ember text-white"
                  : "border-ash bg-white text-smoke hover:bg-ash/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setCity("all")}
            className={`rounded-full border px-3 py-1 ${
              city === "all"
                ? "border-ink bg-ink text-white"
                : "border-ash bg-white text-smoke hover:bg-ash/40"
            }`}
          >
            Tümü
          </button>
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`rounded-full border px-3 py-1 ${
                city === c
                  ? "border-ink bg-ink text-white"
                  : "border-ash bg-white text-smoke hover:bg-ash/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={onLocate}
          disabled={locating}
          className="w-full rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {locating
            ? "Konum alınıyor..."
            : userLocation
              ? "📍 Konumu yenile"
              : "📍 Konumumu kullan"}
        </button>
        {locateError && (
          <p className="text-xs text-red-600">{locateError}</p>
        )}
      </div>

      {routeTo && (
        <div className="border-b border-ash bg-ember/10 p-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-ember">
                Rota
              </div>
              <div className="font-semibold text-ink">{routeTo.name}</div>
            </div>
            <button
              onClick={onClearRoute}
              className="rounded-md border border-ash bg-white px-2 py-1 text-xs hover:bg-ash/40"
            >
              Temizle
            </button>
          </div>
          {routeLoading && (
            <p className="mt-2 text-xs text-smoke">Rota hesaplanıyor...</p>
          )}
          {routeError && (
            <p className="mt-2 text-xs text-red-600">{routeError}</p>
          )}
          {routeDistance != null && routeDuration != null && (
            <p className="mt-2 text-xs text-smoke">
              🚶 {formatDistance(routeDistance)} ·{" "}
              {formatDuration(routeDuration)}
            </p>
          )}
        </div>
      )}

      <ul className="flex-1 divide-y divide-ash overflow-y-auto">
        {filtered.length === 0 && (
          <li className="p-4 text-sm text-smoke">Sonuç yok.</li>
        )}
        {filtered.map((spot) => {
          const dist = userLocation ? haversineKm(userLocation, spot) : null;
          const isSelected = spot.id === selectedId;
          return (
            <li
              key={spot.id}
              className={`cursor-pointer p-4 transition ${
                isSelected ? "bg-ember/10" : "hover:bg-ash/30"
              }`}
              onClick={() => onSelect(spot.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{spot.kind === "cafe" ? "☕" : "🚬"}</span>
                    <span className="truncate font-medium text-ink">
                      {spot.name}
                    </span>
                  </div>
                  {spot.nameJa && (
                    <div className="truncate text-xs text-smoke">
                      {spot.nameJa}
                    </div>
                  )}
                  <p className="mt-1 line-clamp-2 text-xs text-smoke">
                    {spot.description}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-smoke">
                    <span className="rounded bg-ash/60 px-1.5 py-0.5">
                      {spot.city}
                    </span>
                    {spot.hours && (
                      <span className="rounded bg-ash/60 px-1.5 py-0.5">
                        ⏰ {spot.hours}
                      </span>
                    )}
                    {dist != null && (
                      <span className="rounded bg-ash/60 px-1.5 py-0.5">
                        {dist < 1
                          ? `${Math.round(dist * 1000)} m`
                          : `${dist.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRoute(spot);
                }}
                disabled={!userLocation}
                title={
                  userLocation
                    ? "Buraya rota oluştur"
                    : "Önce konumunu paylaş"
                }
                className="mt-2 rounded-md border border-ember px-2 py-1 text-xs font-medium text-ember hover:bg-ember hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ember"
              >
                🧭 Buraya rota
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-ash p-3 text-[11px] text-smoke">
        Veriler topluluk kaynaklıdır. Yerinde doğrulayın. © OpenStreetMap &
        OSRM.
      </footer>
    </aside>
  );
}
