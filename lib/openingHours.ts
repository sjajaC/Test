// Wraps the `opening_hours` parser so we can answer "is this open right now"
// safely (the parser throws on malformed input, which is common in OSM data).
import OpeningHours from "opening_hours";

export function isOpenNow(value: string | undefined, when: Date = new Date()): boolean | null {
  if (!value) return null;
  try {
    const oh = new OpeningHours(value, { lat: 35.68, lon: 139.76 } as never);
    return oh.getState(when);
  } catch {
    return null;
  }
}

export function nextChange(value: string | undefined, when: Date = new Date()): Date | null {
  if (!value) return null;
  try {
    const oh = new OpeningHours(value, { lat: 35.68, lon: 139.76 } as never);
    return oh.getNextChange(when) ?? null;
  } catch {
    return null;
  }
}
