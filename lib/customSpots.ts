"use client";

import { useEffect, useState } from "react";
import type { SmokingSpot, SpotKind } from "./types";

const KEY = "custom-spots-v1";

interface Stored {
  id: string;
  name: string;
  kind: SpotKind;
  lat: number;
  lng: number;
  notes?: string;
  ts: number;
}

function read(): Stored[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: Stored[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("customSpots:change"));
}

function toSpot(s: Stored): SmokingSpot {
  return {
    id: s.id,
    name: s.name,
    kind: s.kind,
    lat: s.lat,
    lng: s.lng,
    smokingTag: "yes",
    amenityTag: s.kind === "area" ? "smoking_area" : s.kind,
    osmUrl: "",
    raw: { source: "user", notes: s.notes || "" },
  };
}

export function addCustomSpot(input: {
  name: string;
  kind: SpotKind;
  lat: number;
  lng: number;
  notes?: string;
}): SmokingSpot {
  const list = read();
  const stored: Stored = {
    id: `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ...input,
    ts: Date.now(),
  };
  list.push(stored);
  write(list);
  return toSpot(stored);
}

export function removeCustomSpot(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function useCustomSpots(): SmokingSpot[] {
  const [spots, setSpots] = useState<SmokingSpot[]>([]);
  useEffect(() => {
    const sync = () => setSpots(read().map(toSpot));
    sync();
    window.addEventListener("customSpots:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("customSpots:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return spots;
}

export function isCustomSpot(spot: SmokingSpot): boolean {
  return spot.id.startsWith("u");
}
