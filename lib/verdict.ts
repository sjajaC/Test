"use client";

import { useEffect, useState } from "react";

export type Verdict = "exists" | "missing";

const KEY = "spot-verdicts-v1";

type Store = Record<string, Verdict>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("verdicts:change"));
}

export function getVerdict(id: string): Verdict | null {
  return read()[id] ?? null;
}

export function setVerdictFor(id: string, v: Verdict | null) {
  const s = read();
  if (v == null) delete s[id];
  else s[id] = v;
  write(s);
}

export function clearAllVerdicts() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("verdicts:change"));
}

export function useVerdicts(): {
  verdicts: Store;
  set: (id: string, v: Verdict | null) => void;
  clearAll: () => void;
} {
  const [verdicts, setVerdicts] = useState<Store>({});

  useEffect(() => {
    setVerdicts(read());
    const handler = () => setVerdicts(read());
    window.addEventListener("verdicts:change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("verdicts:change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    verdicts,
    set: setVerdictFor,
    clearAll: clearAllVerdicts,
  };
}
