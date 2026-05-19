"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { SmokingSpot } from "@/data/spots";

interface MapProps {
  spots: SmokingSpot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  routeFrom: { lat: number; lng: number } | null;
  routeTo: SmokingSpot | null;
  routeGeometry: LatLngExpression[] | null;
}

function FlyTo({ position }: { position: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

function FitToRoute({ points }: { points: LatLngExpression[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      const bounds = L.latLngBounds(points as L.LatLngTuple[]);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [points, map]);
  return null;
}

function buildIcon(kind: "area" | "cafe", selected: boolean) {
  const label = kind === "cafe" ? "☕" : "🚬";
  const cls = [
    "smoking-marker",
    kind === "cafe" ? "smoking-marker--cafe" : "",
    selected ? "smoking-marker--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "",
    html: `<div class="${cls}" style="width:30px;height:30px;">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div class="user-marker" style="width:18px;height:18px;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function Map({
  spots,
  selectedId,
  onSelect,
  routeFrom,
  routeTo,
  routeGeometry,
}: MapProps) {
  const [center] = useState<LatLngExpression>([35.6812, 139.7671]); // Tokyo Station
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const selectedSpot = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId],
  );

  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId]?.openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={buildIcon(spot.kind, spot.id === selectedId)}
          ref={(ref) => {
            markerRefs.current[spot.id] = ref;
          }}
          eventHandlers={{
            click: () => onSelect(spot.id),
          }}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{spot.name}</div>
              {spot.nameJa && (
                <div className="text-xs text-slate-500">{spot.nameJa}</div>
              )}
              <div className="text-xs uppercase tracking-wide text-ember">
                {spot.kind === "cafe" ? "Sigara Kafesi" : "Sigara Alanı"} ·{" "}
                {spot.city}
              </div>
              <p className="text-sm">{spot.description}</p>
              {spot.hours && (
                <div className="text-xs text-slate-500">⏰ {spot.hours}</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {routeFrom && (
        <Marker position={[routeFrom.lat, routeFrom.lng]} icon={userIcon}>
          <Popup>Konumun</Popup>
        </Marker>
      )}

      {routeGeometry && routeGeometry.length > 1 && (
        <Polyline
          positions={routeGeometry}
          pathOptions={{ color: "#f97316", weight: 5, opacity: 0.85 }}
        />
      )}

      <FlyTo
        position={
          selectedSpot ? [selectedSpot.lat, selectedSpot.lng] : null
        }
      />
      <FitToRoute points={routeGeometry} />
    </MapContainer>
  );
}
