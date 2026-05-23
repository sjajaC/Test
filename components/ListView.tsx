"use client";

import { cn } from "@/lib/utils";
import type { SmokingSpot } from "@/lib/types";
import type { Verdict } from "@/lib/verdict";
import SpotCard from "@/components/SpotCard";

interface Props {
  spots: SmokingSpot[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  verdicts: Record<string, Verdict>;
  onVerdict: (id: string, v: Verdict | null) => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function ListView({
  spots,
  selectedId,
  onSelect,
  verdicts,
  onVerdict,
  userLocation,
}: Props) {
  if (spots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Filtreye uyan nokta yok. Filtreleri açıp gevşetmeyi dene.
      </div>
    );
  }
  return (
    <ul className="divide-y">
      {spots.map((spot) => {
        const verdict = verdicts[spot.id] ?? null;
        const isSelected = spot.id === selectedId;
        return (
          <li
            key={spot.id}
            className={cn(
              "cursor-pointer p-4 transition-colors",
              isSelected ? "bg-primary/10" : "hover:bg-muted/50",
            )}
            onClick={() => onSelect(spot.id)}
          >
            <SpotCard
              spot={spot}
              verdict={verdict}
              onVerdict={(v) => onVerdict(spot.id, v)}
              userLocation={userLocation}
              compact
            />
          </li>
        );
      })}
    </ul>
  );
}
