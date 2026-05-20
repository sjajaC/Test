"use client";

import { useState } from "react";
import { CITIES } from "@/lib/cities";
import type { SpotKind } from "@/lib/types";

type Filter = "all" | SpotKind;
export type Tab = "map" | "list";

interface Props {
  cityId: string;
  setCityId: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  hideMissing: boolean;
  setHideMissing: (v: boolean) => void;
  openNow: boolean;
  setOpenNow: (v: boolean) => void;

  totalCount: number;
  filteredCount: number;
  fetchedAt: number | null;
  loading: boolean;
  onRefresh: () => void;

  hasUserLocation: boolean;
  locating: boolean;
  locateError: string | null;
  onLocate: () => void;

  compassMode: boolean;
  onToggleCompass: () => void;
  compassError: string | null;

  addMode: boolean;
  onToggleAddMode: () => void;
}

export default function Header(props: Props) {
  const {
    cityId,
    setCityId,
    query,
    setQuery,
    filter,
    setFilter,
    hideMissing,
    setHideMissing,
    openNow,
    setOpenNow,
    totalCount,
    filteredCount,
    fetchedAt,
    loading,
    onRefresh,
    hasUserLocation,
    locating,
    locateError,
    onLocate,
    compassMode,
    onToggleCompass,
    compassError,
    addMode,
    onToggleAddMode,
  } = props;

  const [expanded, setExpanded] = useState(false);

  return (
    <header className="z-10 border-b border-ash bg-white pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-ink">🇯🇵 Smoke.JP</h1>
          <p className="truncate text-[10px] text-smoke">
            {filteredCount}/{totalCount} nokta
            {fetchedAt && ` · ${new Date(fetchedAt).toLocaleDateString("tr-TR")}`}
          </p>
        </div>
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="rounded-md border border-ash bg-white px-2 py-1.5 text-xs"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={onLocate}
          disabled={locating}
          className={`rounded-md border px-2.5 py-1.5 text-xs disabled:opacity-50 ${
            hasUserLocation
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-ash bg-white text-ink hover:bg-ash/40"
          }`}
          title="Konumum"
        >
          📍
        </button>
        <button
          onClick={onToggleCompass}
          className={`rounded-md border px-2.5 py-1.5 text-xs ${
            compassMode
              ? "border-purple-500 bg-purple-500 text-white"
              : "border-ash bg-white text-ink hover:bg-ash/40"
          }`}
          title="Pusula modu (harita yönüne döner)"
        >
          🧭
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`rounded-md border px-2.5 py-1.5 text-xs ${
            expanded
              ? "border-ink bg-ink text-white"
              : "border-ash bg-white text-ink hover:bg-ash/40"
          }`}
          title="Filtreler"
        >
          ⚙
        </button>
      </div>

      {(locateError || compassError) && (
        <p className="px-3 pb-1 text-[11px] text-red-600">
          {locateError || compassError}
        </p>
      )}

      {expanded && (
        <div className="space-y-2 border-t border-ash px-3 py-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya adres ara..."
            className="w-full rounded-md border border-ash bg-white px-2 py-1.5 text-xs"
          />

          <div className="flex flex-wrap gap-1 text-[11px]">
            {(
              [
                ["all", "Hepsi"],
                ["area", "🚬 Alan"],
                ["cafe", "☕ Kafe"],
                ["bar", "🍺 Bar"],
                ["restaurant", "🍽️ Restoran"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full border px-2 py-1 ${
                  filter === k
                    ? "border-ember bg-ember text-white"
                    : "border-ash bg-white text-smoke"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-smoke">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
                className="h-3 w-3 accent-ember"
              />
              🟢 Sadece şu an açık
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={hideMissing}
                onChange={(e) => setHideMissing(e.target.checked)}
                className="h-3 w-3 accent-ember"
              />
              "Yok" işaretlileri gizle
            </label>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="ml-auto rounded-md border border-ash bg-white px-2 py-1 text-[11px] hover:bg-ash/40 disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "↻ Yenile"}
            </button>
          </div>
        </div>
      )}

      {addMode && (
        <div className="border-t border-purple-300 bg-purple-50 px-3 py-1.5 text-[11px] text-purple-900">
          ➕ Harita üzerine dokunarak yeni nokta ekle.{" "}
          <button onClick={onToggleAddMode} className="underline">
            Vazgeç
          </button>
        </div>
      )}
    </header>
  );
}
