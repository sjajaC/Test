"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header, { type Tab } from "@/components/Header";
import ListView from "@/components/ListView";
import { getCity } from "@/lib/cities";
import { fetchSpots, type FetchResult } from "@/lib/overpass";
import type { SmokingSpot, SpotKind } from "@/lib/types";
import { useVerdicts, type Verdict } from "@/lib/verdict";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

type Filter = "all" | SpotKind;

export default function Page() {
  const [cityId, setCityId] = useState("tokyo");
  const [tab, setTab] = useState<Tab>("map");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [hideMissing, setHideMissing] = useState(true);

  const [spots, setSpots] = useState<SmokingSpot[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleCache, setStaleCache] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { verdicts, set: setVerdict, clearAll } = useVerdicts();

  const city = getCity(cityId);

  const load = useCallback(
    async (id: string, force = false) => {
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
    },
    [],
  );

  useEffect(() => {
    load(cityId);
  }, [cityId, load]);

  const filteredSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots.filter((s) => {
      if (filter !== "all" && s.kind !== filter) return false;
      if (hideMissing && verdicts[s.id] === "missing") return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameJa ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q)
      );
    });
  }, [spots, filter, hideMissing, verdicts, query]);

  const verdictCount = useMemo(() => {
    const v = Object.values(verdicts);
    return {
      exists: v.filter((x) => x === "exists").length,
      missing: v.filter((x) => x === "missing").length,
    };
  }, [verdicts]);

  return (
    <main className="flex h-screen w-screen flex-col bg-slate-50">
      <Header
        cityId={cityId}
        setCityId={setCityId}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        hideMissing={hideMissing}
        setHideMissing={setHideMissing}
        tab={tab}
        setTab={setTab}
        totalCount={spots.length}
        filteredCount={filteredSpots.length}
        fetchedAt={fetchedAt}
        loading={loading}
        onRefresh={() => load(cityId, true)}
      />

      {(error || staleCache || verdictCount.missing + verdictCount.exists > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ash bg-amber-50 px-3 py-1.5 text-[11px] text-amber-900">
          {error && (
            <span>
              ⚠ Veri çekilemedi: {error}. Yeniden dene veya başka şehir seç.
            </span>
          )}
          {staleCache && !error && (
            <span>📦 Önbellekten eski veri gösteriliyor.</span>
          )}
          {verdictCount.exists + verdictCount.missing > 0 && (
            <span className="ml-auto">
              İşaretlerin: ✔ {verdictCount.exists} · ✗ {verdictCount.missing}
              <button
                onClick={clearAll}
                className="ml-2 underline hover:text-amber-700"
              >
                temizle
              </button>
            </span>
          )}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        {loading && spots.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-smoke">
            {city.name} verisi çekiliyor...
          </div>
        )}

        <div
          className={`absolute inset-0 ${tab === "map" ? "" : "invisible"}`}
        >
          <Map
            spots={filteredSpots}
            center={city.center}
            zoom={city.zoom}
            selectedId={selectedId}
            onSelect={setSelectedId}
            verdicts={verdicts}
            onVerdict={setVerdict}
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
          />
        </div>
      </div>

      <footer className="border-t border-ash bg-white px-3 py-1.5 text-[10px] text-smoke">
        Veri © OpenStreetMap katkıda bulunanlar · Sahada teyit edin · Yön
        Google Maps üzerinden açılır.
      </footer>
    </main>
  );
}
