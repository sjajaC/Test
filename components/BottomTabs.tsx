"use client";

import type { Tab } from "@/components/Header";

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  onAdd: () => void;
  addActive: boolean;
}

export default function BottomTabs({ tab, setTab, onAdd, addActive }: Props) {
  return (
    <nav className="z-10 grid grid-cols-3 items-stretch border-t border-ash bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => setTab("map")}
        className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          tab === "map" ? "text-ember" : "text-smoke"
        }`}
      >
        <span className="text-lg">🗺️</span>
        Harita
      </button>
      <button
        onClick={onAdd}
        className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          addActive ? "text-purple-600" : "text-smoke"
        }`}
      >
        <span
          className={`flex h-9 w-9 -translate-y-3 items-center justify-center rounded-full text-lg shadow-md ${
            addActive
              ? "bg-purple-500 text-white"
              : "bg-ember text-white"
          }`}
        >
          ➕
        </span>
        <span className="-mt-2">Ekle</span>
      </button>
      <button
        onClick={() => setTab("list")}
        className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
          tab === "list" ? "text-ember" : "text-smoke"
        }`}
      >
        <span className="text-lg">📋</span>
        Liste
      </button>
    </nav>
  );
}
