"use client";

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
  tab: Tab;
  setTab: (t: Tab) => void;

  totalCount: number;
  filteredCount: number;
  fetchedAt: number | null;
  loading: boolean;
  onRefresh: () => void;
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
    tab,
    setTab,
    totalCount,
    filteredCount,
    fetchedAt,
    loading,
    onRefresh,
  } = props;

  return (
    <header className="z-10 flex flex-col gap-3 border-b border-ash bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-ink">
            🇯🇵 Japan Smoking Map
          </h1>
          <p className="text-[11px] text-smoke">
            OpenStreetMap topluluk verisi · {filteredCount}/{totalCount} nokta
            {fetchedAt && (
              <>
                {" "}
                · son {new Date(fetchedAt).toLocaleString("tr-TR")}
              </>
            )}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-ash bg-white px-3 py-1.5 text-xs hover:bg-ash/40 disabled:opacity-50"
          title="Verileri yeniden çek"
        >
          {loading ? "Yükleniyor..." : "↻ Yenile"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="rounded-md border border-ash bg-white px-2 py-1.5 text-xs"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.nameJa})
            </option>
          ))}
        </select>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim / adres ara..."
          className="min-w-0 flex-1 rounded-md border border-ash bg-white px-2 py-1.5 text-xs focus:border-ember focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 text-[11px]">
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
                : "border-ash bg-white text-smoke hover:bg-ash/40"
            }`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-ash bg-white px-2 py-1 text-smoke">
          <input
            type="checkbox"
            checked={hideMissing}
            onChange={(e) => setHideMissing(e.target.checked)}
            className="h-3 w-3 accent-ember"
          />
          "Yok" işaretlileri gizle
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-ash bg-ash/40 p-0.5 text-xs font-medium">
        <button
          onClick={() => setTab("map")}
          className={`rounded-md px-3 py-1.5 transition ${
            tab === "map" ? "bg-white text-ink shadow" : "text-smoke"
          }`}
        >
          🗺️ Harita
        </button>
        <button
          onClick={() => setTab("list")}
          className={`rounded-md px-3 py-1.5 transition ${
            tab === "list" ? "bg-white text-ink shadow" : "text-smoke"
          }`}
        >
          📋 Liste
        </button>
      </div>
    </header>
  );
}
