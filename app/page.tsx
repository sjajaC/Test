"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header, { type Tab } from "@/components/Header";
import ListView from "@/components/ListView";
import BottomTabs from "@/components/BottomTabs";
import AddSpotDialog from "@/components/AddSpotDialog";
import { CITIES, getCity } from "@/lib/cities";
import { findCityByCoords, haversineKm } from "@/lib/geo";
import { fetchSpots, type FetchResult } from "@/lib/overpass";
import type { SmokingSpot, SpotKind } from "@/lib/types";
import { useVerdicts } from "@/lib/verdict";
import { useCustomSpots, addCustomSpot } from "@/lib/customSpots";
import { isOpenNow } from "@/lib/openingHours";
import { useHeading } from "@/lib/heading";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

type Filter = "all" | SpotKind;

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export default function Page() {
  const [cityId, setCityId] = useState("tokyo");
  const [tab, setTab] = useState<Tab>("map");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [hideMissing, setHideMissing] = useState(true);
  const [openNow, setOpenNow] = useState(false);

  const [spots, setSpots] = useState<SmokingSpot[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleCache, setStaleCache] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);
  const autoLocatedOnce = useRef(false);

  const [compassMode, setCompassMode] = useState(false);
  const { heading, error: compassError, request: requestCompass } =
    useHeading(compassMode);

  const [addMode, setAddMode] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const { verdicts, set: setVerdict, clearAll } = useVerdicts();
  const customSpots = useCustomSpots();

  const city = getCity(cityId);

  const load = useCallback(async (id: string, force = false) => {
    const c = getCity(id);
    setLoading(true);
    setError(null);
    try {
      const res: FetchResult = await fetchSpots(c.id, c.bbox, { force });
      setSpots(res.spots);
      setFetchedAt(res.fetchedAt);
      setStaleCache(res.staleCache);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      setSpots([]);
      setFetchedAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(cityId);
  }, [cityId, load]);

  const locate = useCallback(
    (recenter = true) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setLocateError("Tarayıcı konum hizmetini desteklemiyor.");
        return;
      }
      setLocating(true);
      setLocateError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setUserLocation(loc);
          setLocating(false);
          const detected = findCityByCoords(loc.lat, loc.lng, CITIES);
          if (detected && detected.id !== cityId) setCityId(detected.id);
          if (recenter) setRecenterToken((t) => t + 1);
        },
        (err) => {
          const messages: Record<number, string> = {
            1: "Konum izni reddedildi.",
            2: "Konum alınamadı.",
            3: "Konum zaman aşımı.",
          };
          setLocateError(messages[err.code] ?? err.message ?? "Konum alınamadı.");
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
    },
    [cityId],
  );

  useEffect(() => {
    if (autoLocatedOnce.current) return;
    autoLocatedOnce.current = true;
    locate(true);
  }, [locate]);

  const combinedSpots = useMemo(() => {
    const bbox = city.bbox;
    const inBbox = customSpots.filter(
      (s) => s.lat >= bbox[0] && s.lat <= bbox[2] && s.lng >= bbox[1] && s.lng <= bbox[3],
    );
    return [...inBbox, ...spots];
  }, [spots, customSpots, city.bbox]);

  const filteredSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = combinedSpots.filter((s) => {
      if (filter !== "all" && s.kind !== filter) return false;
      if (hideMissing && verdicts[s.id] === "missing") return false;
      if (openNow) {
        const open = isOpenNow(s.openingHours);
        if (open !== true) return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameJa ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q)
      );
    });
    if (userLocation) {
      const loc = userLocation;
      list = [...list].sort(
        (a, b) =>
          haversineKm(loc, { lat: a.lat, lng: a.lng }) -
          haversineKm(loc, { lat: b.lat, lng: b.lng }),
      );
    }
    return list;
  }, [combinedSpots, filter, hideMissing, openNow, verdicts, query, userLocation]);

  const verdictCount = useMemo(() => {
    const v = Object.values(verdicts);
    return {
      exists: v.filter((x) => x === "exists").length,
      missing: v.filter((x) => x === "missing").length,
    };
  }, [verdicts]);

  const onToggleCompass = useCallback(async () => {
    if (!compassMode) {
      await requestCompass();
      setCompassMode(true);
    } else {
      setCompassMode(false);
    }
  }, [compassMode, requestCompass]);

  return (
    <main className="fixed inset-0 flex flex-col bg-slate-50">
      <Header
        cityId={cityId}
        setCityId={setCityId}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        hideMissing={hideMissing}
        setHideMissing={setHideMissing}
        openNow={openNow}
        setOpenNow={setOpenNow}
        totalCount={combinedSpots.length}
        filteredCount={filteredSpots.length}
        fetchedAt={fetchedAt}
        loading={loading}
        onRefresh={() => load(cityId, true)}
        hasUserLocation={!!userLocation}
        locating={locating}
        locateError={locateError}
        onLocate={() =>
          userLocation ? setRecenterToken((t) => t + 1) : locate(true)
        }
        compassMode={compassMode}
        onToggleCompass={onToggleCompass}
        compassError={compassError}
        addMode={addMode}
        onToggleAddMode={() => setAddMode((v) => !v)}
      />

      {(error ||
        staleCache ||
        verdictCount.missing + verdictCount.exists > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ash bg-amber-50 px-3 py-1 text-[11px] text-amber-900">
          {error && <span>⚠ {error}</span>}
          {staleCache && !error && <span>📦 Önbellekten gösteriliyor.</span>}
          {verdictCount.exists + verdictCount.missing > 0 && (
            <span className="ml-auto">
              ✔ {verdictCount.exists} · ✗ {verdictCount.missing}
              <button onClick={clearAll} className="ml-2 underline">
                temizle
              </button>
            </span>
          )}
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading && spots.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-smoke">
            {city.name} verisi çekiliyor...
          </div>
        )}

        <div className={`absolute inset-0 ${tab === "map" ? "" : "invisible"}`}>
          <Map
            spots={filteredSpots}
            center={city.center}
            zoom={city.zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
            verdicts={verdicts}
            onVerdict={setVerdict}
            userLocation={userLocation}
            recenterToken={recenterToken}
            compassMode={compassMode}
            heading={heading}
            addMode={addMode}
            onMapClickInAddMode={(c) => {
              setAddCoords(c);
              setAddMode(false);
            }}
          />
        </div>

        <div
          className={`absolute inset-0 overflow-y-auto bg-white ${
            tab === "list" ? "" : "hidden"
          }`}
        >
          <ListView
            spots={filteredSpots}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              if (id) setTab("map");
            }}
            verdicts={verdicts}
            onVerdict={setVerdict}
            userLocation={userLocation}
          />
        </div>
      </div>

      <BottomTabs
        tab={tab}
        setTab={setTab}
        onAdd={() => {
          setAddMode((v) => !v);
          setTab("map");
        }}
        addActive={addMode}
      />

      {addCoords && (
        <AddSpotDialog
          coords={addCoords}
          onCancel={() => setAddCoords(null)}
          onSave={(data) => {
            const created = addCustomSpot({
              name: data.name,
              kind: data.kind,
              lat: addCoords.lat,
              lng: addCoords.lng,
              notes: data.notes,
            });
            setAddCoords(null);
            setSelectedId(created.id);
          }}
        />
      )}
    </main>
  );
}
