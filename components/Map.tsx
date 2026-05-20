"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { SmokingSpot } from "@/lib/types";
import type { Verdict } from "@/lib/verdict";
import SpotCard from "@/components/SpotCard";

interface Props {
  spots: SmokingSpot[];
  center: [number, number];
  zoom: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  verdicts: Record<string, Verdict>;
  onVerdict: (id: string, v: Verdict | null) => void;
  userLocation: { lat: number; lng: number; accuracy?: number } | null;
  recenterToken: number;
}

function ViewController({
  center,
  zoom,
  selected,
  userLocation,
  recenterToken,
}: {
  center: [number, number];
  zoom: number;
  selected: SmokingSpot | null;
  userLocation: { lat: number; lng: number } | null;
  recenterToken: number;
}) {
  const map = useMap();

  // City change: snap to that city.
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  // Selected spot: fly to it.
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), {
        duration: 0.6,
      });
    }
  }, [selected, map]);

  // Recenter to user when token bumps.
  useEffect(() => {
    if (userLocation && recenterToken > 0) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.7 });
    }
  }, [recenterToken, userLocation, map]);

  return null;
}

function spotIcon(spot: SmokingSpot, verdict: Verdict | null, selected: boolean) {
  const icon = ({
    area: "🚬",
    cafe: "☕",
    bar: "🍺",
    restaurant: "🍽️",
  } as const)[spot.kind];
  const bg =
    verdict === "missing"
      ? "#9ca3af"
      : verdict === "exists"
        ? "#16a34a"
        : spot.kind === "area"
          ? "#f97316"
          : "#6366f1";
  const opacity = verdict === "missing" ? 0.55 : 1;
  const outline = selected ? "outline:3px solid #0f172a; outline-offset:2px;" : "";
  return L.divIcon({
    className: "",
    html: `<div style="background:${bg};opacity:${opacity};width:30px;height:30px;border:2px solid white;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.3);${outline}">${icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2563eb;width:18px;height:18px;border:3px solid white;border-radius:9999px;box-shadow:0 0 0 6px rgba(37,99,235,0.25);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function Map({
  spots,
  center,
  zoom,
  selectedId,
  onSelect,
  verdicts,
  onVerdict,
  userLocation,
  recenterToken,
}: Props) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const selected = spots.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId) markerRefs.current[selectedId]?.openPopup();
  }, [selectedId]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {spots.map((spot) => {
        const verdict = verdicts[spot.id] ?? null;
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={spotIcon(spot, verdict, spot.id === selectedId)}
            ref={(ref) => {
              markerRefs.current[spot.id] = ref;
            }}
            eventHandlers={{
              click: () => onSelect(spot.id),
              popupclose: () => onSelect(null),
            }}
          >
            <Popup minWidth={260} maxWidth={300}>
              <SpotCard
                spot={spot}
                verdict={verdict}
                onVerdict={(v) => onVerdict(spot.id, v)}
                userLocation={userLocation}
                compact
              />
            </Popup>
          </Marker>
        );
      })}

      {userLocation && (
        <>
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>Şu anki konumun</Popup>
          </Marker>
          {userLocation.accuracy && userLocation.accuracy < 1000 && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#2563eb",
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
          )}
        </>
      )}

      <ViewController
        center={center}
        zoom={zoom}
        selected={selected}
        userLocation={userLocation}
        recenterToken={recenterToken}
      />
    </MapContainer>
  );
}
