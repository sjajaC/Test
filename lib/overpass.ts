import type { SmokingSpot, SpotKind } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function buildQuery(bbox: [number, number, number, number]): string {
  const [s, w, n, e] = bbox;
  const box = `${s},${w},${n},${e}`;
  // Pulls designated outdoor smoking areas and any food/drink venue
  // that has been tagged with a smoking value implying smoking is permitted.
  return `[out:json][timeout:30];
(
  node["amenity"="smoking_area"](${box});
  way["amenity"="smoking_area"](${box});
  node["smoking"~"^(yes|separated|outside|outdoors|dedicated|isolated|smoking)$"]["amenity"~"^(cafe|bar|restaurant|pub|fast_food)$"](${box});
  way["smoking"~"^(yes|separated|outside|outdoors|dedicated|isolated|smoking)$"]["amenity"~"^(cafe|bar|restaurant|pub|fast_food)$"](${box});
);
out center tags;`;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const JP_RE = /[぀-ヿ一-鿿]/;

function normalize(el: OverpassElement): SmokingSpot | null {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  let kind: SpotKind = "area";
  if (tags.amenity === "smoking_area") kind = "area";
  else if (tags.amenity === "cafe") kind = "cafe";
  else if (tags.amenity === "bar" || tags.amenity === "pub") kind = "bar";
  else if (tags.amenity === "restaurant" || tags.amenity === "fast_food")
    kind = "restaurant";

  const rawName = tags.name || tags["name:en"] || tags["name:ja"];
  const defaultName =
    kind === "area" ? "Designated Smoking Area" : "Smoking-friendly venue";
  const name = rawName ?? defaultName;
  const nameJa =
    tags["name:ja"] || (tags.name && JP_RE.test(tags.name) ? tags.name : undefined);

  const addressParts = [
    tags["addr:full"],
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);
  const address = addressParts.length ? addressParts.join(", ") : undefined;

  return {
    id: `${el.type[0]}${el.id}`,
    name,
    nameJa: nameJa && nameJa !== name ? nameJa : undefined,
    kind,
    lat,
    lng,
    smokingTag: tags.smoking,
    amenityTag: tags.amenity,
    openingHours: tags.opening_hours,
    address,
    website: tags.website || tags["contact:website"],
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    raw: tags,
  };
}

const CACHE_KEY = "spots-cache-v2";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

interface CacheEntry {
  ts: number;
  spots: SmokingSpot[];
}
type CacheMap = Record<string, CacheEntry>;

function readCache(): CacheMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache: CacheMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded — drop cache silently
  }
}

export interface FetchResult {
  spots: SmokingSpot[];
  fromCache: boolean;
  staleCache: boolean;
  fetchedAt: number;
}

export async function fetchSpots(
  cityId: string,
  bbox: [number, number, number, number],
  opts: { force?: boolean } = {},
): Promise<FetchResult> {
  const cache = readCache();
  const entry = cache[cityId];
  if (!opts.force && entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return {
      spots: entry.spots,
      fromCache: true,
      staleCache: false,
      fetchedAt: entry.ts,
    };
  }

  const query = buildQuery(bbox);
  let lastErr: Error | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) {
        lastErr = new Error(`${endpoint} → HTTP ${res.status}`);
        continue;
      }
      const data: OverpassResponse = await res.json();
      const spots = data.elements
        .map(normalize)
        .filter((s): s is SmokingSpot => s !== null);
      const ts = Date.now();
      cache[cityId] = { ts, spots };
      writeCache(cache);
      return { spots, fromCache: false, staleCache: false, fetchedAt: ts };
    } catch (e) {
      lastErr = e as Error;
    }
  }
  if (entry) {
    return {
      spots: entry.spots,
      fromCache: true,
      staleCache: true,
      fetchedAt: entry.ts,
    };
  }
  throw lastErr ?? new Error("Overpass API erişilemiyor");
}
