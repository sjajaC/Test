"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import {
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
}

function ViewController({
  center,
  zoom,
  selected,
}: {
  center: [number, number];
  zoom: number;
  selected: SmokingSpot | null;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), {
        duration: 0.6,
      });
    }
  }, [selected, map]);
  return null;
}

function buildIcon(spot: SmokingSpot, verdict: Verdict | null, selected: boolean) {
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

export default function Map({
  spots,
  center,
  zoom,
  selectedId,
  onSelect,
  verdicts,
  onVerdict,
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
            icon={buildIcon(spot, verdict, spot.id === selectedId)}
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
                compact
              />
            </Popup>
          </Marker>
        );
      })}

      <ViewController center={center} zoom={zoom} selected={selected} />
    </MapContainer>
  );
}
