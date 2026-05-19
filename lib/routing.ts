import type { LatLngExpression } from "leaflet";

export interface RouteResult {
  geometry: LatLngExpression[];
  distanceMeters: number;
  durationSeconds: number;
}

// Uses the public OSRM demo server for walking routes. No API key required.
// For production volume, swap for a self-hosted OSRM or a paid provider.
export async function fetchWalkingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<RouteResult> {
  const url =
    `https://router.project-osrm.org/route/v1/foot/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`);
  const data = await res.json();

  if (!data.routes?.length) throw new Error("No route found");

  const route = data.routes[0];
  const coords: [number, number][] = route.geometry.coordinates;
  // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
  const geometry: LatLngExpression[] = coords.map(([lng, lat]) => [lat, lng]);

  return {
    geometry,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatDuration(s: number): string {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return `${h} sa ${rem} dk`;
}
