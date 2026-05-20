"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import MapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { SmokingSpot } from "@/lib/types";
import type { Verdict } from "@/lib/verdict";
import SpotCard from "@/components/SpotCard";
import { isCustomSpot } from "@/lib/customSpots";

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 },
  ],
};

const KIND_ICON = {
  area: "🚬",
  cafe: "☕",
  bar: "🍺",
  restaurant: "🍽️",
} as const;

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
  compassMode: boolean;
  heading: number | null;
  addMode: boolean;
  onMapClickInAddMode: (coords: { lat: number; lng: number }) => void;
}

export default function Map(props: Props) {
  const {
    spots,
    center,
    zoom,
    selectedId,
    onSelect,
    verdicts,
    onVerdict,
    userLocation,
    recenterToken,
    compassMode,
    heading,
    addMode,
    onMapClickInAddMode,
  } = props;

  const mapRef = useRef<MapRef | null>(null);
  const lastCityKey = useRef<string>("");

  // Snap to new city center.
  useEffect(() => {
    const key = `${center[0].toFixed(3)},${center[1].toFixed(3)}`;
    if (key === lastCityKey.current) return;
    lastCityKey.current = key;
    mapRef.current?.flyTo({
      center: [center[1], center[0]],
      zoom,
      duration: 800,
    });
  }, [center, zoom]);

  // Fly to user when recenterToken bumps.
  useEffect(() => {
    if (recenterToken > 0 && userLocation) {
      mapRef.current?.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: Math.max(mapRef.current.getZoom(), 15),
        duration: 700,
      });
    }
  }, [recenterToken, userLocation]);

  // Fly to selected spot.
  const selected = useMemo(
    () => spots.find((s) => s.id === selectedId) ?? null,
    [spots, selectedId],
  );
  useEffect(() => {
    if (selected) {
      mapRef.current?.flyTo({
        center: [selected.lng, selected.lat],
        zoom: Math.max(mapRef.current.getZoom(), 16),
        duration: 600,
      });
    }
  }, [selected]);

  // Compass mode: rotate map to current heading.
  useEffect(() => {
    if (!compassMode || heading == null) return;
    mapRef.current?.easeTo({ bearing: heading, duration: 200 });
  }, [compassMode, heading]);

  const handleClick = (e: maplibregl.MapMouseEvent) => {
    if (addMode) {
      onMapClickInAddMode({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      return;
    }
    onSelect(null);
  };

  return (
    <MapGL
      ref={mapRef}
      mapStyle={OSM_STYLE}
      initialViewState={{
        longitude: center[1],
        latitude: center[0],
        zoom,
      }}
      style={{ width: "100%", height: "100%" }}
      onClick={handleClick}
      cursor={addMode ? "crosshair" : undefined}
      maxZoom={19}
    >
      <NavigationControl
        position="top-right"
        showCompass
        showZoom
        visualizePitch={false}
      />
      <GeolocateControl
        position="top-right"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
      />

      {spots.map((spot) => {
        const verdict = verdicts[spot.id] ?? null;
        const isCustom = isCustomSpot(spot);
        const bg =
          verdict === "missing"
            ? "#9ca3af"
            : verdict === "exists"
              ? "#16a34a"
              : isCustom
                ? "#a855f7"
                : spot.kind === "area"
                  ? "#f97316"
                  : "#6366f1";
        const opacity = verdict === "missing" ? 0.55 : 1;
        const isSel = spot.id === selectedId;
        return (
          <Marker
            key={spot.id}
            longitude={spot.lng}
            latitude={spot.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(spot.id);
            }}
          >
            <div
              style={{
                background: bg,
                opacity,
                width: 30,
                height: 30,
                border: "2px solid white",
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 14,
                boxShadow: "0 2px 6px rgba(0,0,0,.3)",
                outline: isSel ? "3px solid #0f172a" : undefined,
                outlineOffset: isSel ? 2 : undefined,
                cursor: "pointer",
              }}
            >
              {KIND_ICON[spot.kind]}
            </div>
          </Marker>
        );
      })}

      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={20}
          closeButton
          closeOnClick={false}
          onClose={() => onSelect(null)}
          maxWidth="320px"
        >
          <SpotCard
            spot={selected}
            verdict={verdicts[selected.id] ?? null}
            onVerdict={(v) => onVerdict(selected.id, v)}
            userLocation={userLocation}
            compact
          />
        </Popup>
      )}
    </MapGL>
  );
}
