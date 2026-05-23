"use client";

import { Map as MapIcon, ListIcon, Plus } from "lucide-react";
import type { Tab } from "@/components/Header";
import { cn } from "@/lib/utils";

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  onAdd: () => void;
  addActive: boolean;
}

export default function BottomTabs({ tab, setTab, onAdd, addActive }: Props) {
  return (
    <nav className="z-10 grid grid-cols-3 items-stretch border-t bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => setTab("map")}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
          tab === "map" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <MapIcon className="h-5 w-5" />
        Harita
      </button>

      <button
        onClick={onAdd}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
          addActive ? "text-purple-700" : "text-muted-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 -translate-y-3 items-center justify-center rounded-full text-lg shadow-md transition-colors",
            addActive ? "bg-purple-600 text-white" : "bg-primary text-primary-foreground",
          )}
        >
          <Plus className="h-5 w-5" />
        </span>
        <span className="-mt-2">Ekle</span>
      </button>

      <button
        onClick={() => setTab("list")}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
          tab === "list" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ListIcon className="h-5 w-5" />
        Liste
      </button>
    </nav>
  );
}
