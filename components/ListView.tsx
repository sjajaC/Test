"use client";

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
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-smoke">
        Bu şehirde filtrelenen kriterlere uyan nokta yok.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-ash overflow-y-auto">
      {spots.map((spot) => {
        const verdict = verdicts[spot.id] ?? null;
        const isSelected = spot.id === selectedId;
        return (
          <li
            key={spot.id}
            className={`cursor-pointer transition ${
              isSelected ? "bg-ember/10" : "hover:bg-ash/30"
            }`}
            onClick={() => onSelect(spot.id)}
          >
            <SpotCard
              spot={spot}
              verdict={verdict}
              onVerdict={(v) => onVerdict(spot.id, v)}
              userLocation={userLocation}
            />
          </li>
        );
      })}
    </ul>
  );
}
