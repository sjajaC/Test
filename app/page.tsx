"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { LatLngExpression } from "leaflet";
import Sidebar from "@/components/Sidebar";
import { SPOTS, type SmokingSpot, type SpotKind } from "@/data/spots";
import { fetchWalkingRoute } from "@/lib/routing";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

type Filter = "all" | SpotKind;

export default function Page() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [city, setCity] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const [routeTo, setRouteTo] = useState<SmokingSpot | null>(null);
  const [routeGeometry, setRouteGeometry] =
    useState<LatLngExpression[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);

  const handleLocate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocateError("Tarayıcı konum hizmetini desteklemiyor.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocateError(err.message || "Konum alınamadı.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleRoute = useCallback(
    async (spot: SmokingSpot) => {
      if (!userLocation) return;
      setRouteTo(spot);
      setSelectedId(spot.id);
      setRouteLoading(true);
      setRouteError(null);
      setRouteGeometry(null);
      setRouteDistance(null);
      setRouteDuration(null);
      try {
        const r = await fetchWalkingRoute(userLocation, {
          lat: spot.lat,
          lng: spot.lng,
        });
        setRouteGeometry(r.geometry);
        setRouteDistance(r.distanceMeters);
        setRouteDuration(r.durationSeconds);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Rota alınamadı.";
        setRouteError(msg);
      } finally {
        setRouteLoading(false);
      }
    },
    [userLocation],
  );

  const handleClearRoute = useCallback(() => {
    setRouteTo(null);
    setRouteGeometry(null);
    setRouteDistance(null);
    setRouteDuration(null);
    setRouteError(null);
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col sm:flex-row">
      <Sidebar
        spots={SPOTS}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        city={city}
        setCity={setCity}
        selectedId={selectedId}
        onSelect={setSelectedId}
        userLocation={userLocation}
        locating={locating}
        locateError={locateError}
        onLocate={handleLocate}
        routeTo={routeTo}
        routeLoading={routeLoading}
        routeError={routeError}
        routeDistance={routeDistance}
        routeDuration={routeDuration}
        onRoute={handleRoute}
        onClearRoute={handleClearRoute}
      />
      <div className="relative h-full min-h-[400px] flex-1">
        <Map
          spots={SPOTS}
          selectedId={selectedId}
          onSelect={setSelectedId}
          routeFrom={userLocation}
          routeTo={routeTo}
          routeGeometry={routeGeometry}
        />
      </div>
    </main>
  );
}
