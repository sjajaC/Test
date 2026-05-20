"use client";

import type { SmokingSpot, SpotKind } from "@/lib/types";
import type { Verdict } from "@/lib/verdict";
import { googleMapsDirUrl } from "@/lib/url";
import { formatDistance, haversineKm } from "@/lib/geo";

const KIND_LABEL: Record<SpotKind, string> = {
  area: "Sigara Alanı",
  cafe: "Kafe",
  bar: "Bar / Pub",
  restaurant: "Restoran",
};

const KIND_ICON: Record<SpotKind, string> = {
  area: "🚬",
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽️",
};

const SMOKING_LABEL: Record<string, string> = {
  yes: "Sigara serbest",
  separated: "Ayrı sigara bölümü",
  outside: "Dışarıda izinli",
  outdoors: "Dışarıda izinli",
  dedicated: "Ayrı sigara odası",
  isolated: "İzole sigara odası",
  smoking: "Sigara izinli",
};

interface Props {
  spot: SmokingSpot;
  verdict: Verdict | null;
  onVerdict: (v: Verdict | null) => void;
  userLocation?: { lat: number; lng: number } | null;
  compact?: boolean;
  onFocus?: () => void;
}

export default function SpotCard({
  spot,
  verdict,
  onVerdict,
  userLocation,
  compact,
  onFocus,
}: Props) {
  const smokingLabel = spot.smokingTag
    ? SMOKING_LABEL[spot.smokingTag] ?? spot.smokingTag
    : null;
  const distance = userLocation
    ? haversineKm(userLocation, { lat: spot.lat, lng: spot.lng })
    : null;

  return (
    <article
      className={`flex flex-col gap-2 ${compact ? "" : "p-4"}`}
      onClick={onFocus}
    >
      <header className="flex items-start gap-2">
        <span className="text-lg leading-none">{KIND_ICON[spot.kind]}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">
            {spot.name}
          </h3>
          {spot.nameJa && (
            <p className="truncate text-xs text-smoke">{spot.nameJa}</p>
          )}
        </div>
        {verdict && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              verdict === "exists"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {verdict === "exists" ? "✔ Doğrulandı" : "✗ Mevcut değil"}
          </span>
        )}
      </header>

      <div className="flex flex-wrap gap-1 text-[11px] text-smoke">
        <span className="rounded bg-ash/60 px-1.5 py-0.5">
          {KIND_LABEL[spot.kind]}
        </span>
        {smokingLabel && (
          <span className="rounded bg-ember/15 px-1.5 py-0.5 text-ember">
            {smokingLabel}
          </span>
        )}
        {spot.openingHours && (
          <span className="rounded bg-ash/60 px-1.5 py-0.5">
            ⏰ {spot.openingHours}
          </span>
        )}
        {distance != null && (
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">
            🚶 {formatDistance(distance)}
          </span>
        )}
      </div>

      {spot.address && (
        <p className="text-xs text-smoke">📍 {spot.address}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={googleMapsDirUrl(spot.lat, spot.lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-md bg-ember px-2.5 py-1.5 text-xs font-medium text-white hover:bg-ember/90"
        >
          🧭 Buraya rota
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerdict(verdict === "exists" ? null : "exists");
          }}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
            verdict === "exists"
              ? "border-green-600 bg-green-600 text-white"
              : "border-green-600 text-green-700 hover:bg-green-50"
          }`}
        >
          ✔ Var
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerdict(verdict === "missing" ? null : "missing");
          }}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
            verdict === "missing"
              ? "border-red-600 bg-red-600 text-white"
              : "border-red-600 text-red-700 hover:bg-red-50"
          }`}
        >
          ✗ Yok
        </button>
        <a
          href={spot.osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto text-[11px] text-smoke underline hover:text-ink"
        >
          OSM'de gör →
        </a>
      </div>
    </article>
  );
}
