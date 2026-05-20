"use client";

import { useEffect, useState } from "react";

type CompassEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

// Returns the compass heading in degrees (0 = north, clockwise) or null
// if the device can't provide it.
export function useHeading(enabled: boolean): {
  heading: number | null;
  error: string | null;
  request: () => Promise<void>;
} {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = async () => {
    setError(null);
    type IOSDOE = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const ctor = DeviceOrientationEvent as IOSDOE | undefined;
    if (ctor && typeof ctor.requestPermission === "function") {
      try {
        const res = await ctor.requestPermission();
        if (res !== "granted") {
          setError("Pusula izni reddedildi.");
        }
      } catch (e) {
        setError("Pusula izni alınamadı.");
      }
    }
  };

  useEffect(() => {
    if (!enabled) {
      setHeading(null);
      return;
    }
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setError("Cihaz pusulayı desteklemiyor.");
      return;
    }
    const handler = (e: CompassEvent) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === "number") {
        h = e.webkitCompassHeading;
      } else if (e.absolute && typeof e.alpha === "number") {
        h = 360 - e.alpha;
      } else if (typeof e.alpha === "number") {
        h = 360 - e.alpha;
      }
      if (h != null && !Number.isNaN(h)) {
        setHeading(((h % 360) + 360) % 360);
      }
    };
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler as EventListener);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler as EventListener);
      window.removeEventListener("deviceorientation", handler as EventListener);
    };
  }, [enabled]);

  return { heading, error, request };
}
