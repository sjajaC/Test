"use client";

import {
  Navigation,
  Check,
  X,
  Coffee,
  Beer,
  UtensilsCrossed,
  Cigarette,
  Clock,
  MapPin,
  Footprints,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCustomSpot, removeCustomSpot } from "@/lib/customSpots";
import { formatDistance, haversineKm } from "@/lib/geo";
import { isOpenNow } from "@/lib/openingHours";
import type { SmokingSpot, SpotKind } from "@/lib/types";
import { googleMapsDirUrl } from "@/lib/url";
import type { Verdict } from "@/lib/verdict";

const KIND_LABEL: Record<SpotKind, string> = {
  area: "Sigara Alanı",
  cafe: "Kafe",
  bar: "Bar / Pub",
  restaurant: "Restoran",
};

const KIND_ICON: Record<SpotKind, React.ComponentType<{ className?: string }>> = {
  area: Cigarette,
  cafe: Coffee,
  bar: Beer,
  restaurant: UtensilsCrossed,
};

const SMOKING_LABEL: Record<string, string> = {
  yes: "Sigara serbest",
  separated: "Ayrı sigara bölümü",
  outside: "Dışarıda izinli",
  outdoors: "Dışarıda izinli",
  dedicated: "Ayrı sigara odası",
  isolated: "İzole sigara odası",
  smoking: "Sigara izinli",
};

function formatWalkingTime(km: number): string {
  const min = Math.round((km / 5) * 60);
  if (min < 1) return "<1 dk";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  return `${h} sa ${rem} dk`;
}

interface Props {
  spot: SmokingSpot;
  verdict: Verdict | null;
  onVerdict: (v: Verdict | null) => void;
  userLocation?: { lat: number; lng: number } | null;
  compact?: boolean;
  onFocus?: () => void;
}

export default function SpotCard({
  spot,
  verdict,
  onVerdict,
  userLocation,
  compact,
  onFocus,
}: Props) {
  const smokingLabel = spot.smokingTag
    ? SMOKING_LABEL[spot.smokingTag] ?? spot.smokingTag
    : null;
  const distance = userLocation
    ? haversineKm(userLocation, { lat: spot.lat, lng: spot.lng })
    : null;
  const open = isOpenNow(spot.openingHours);
  const custom = isCustomSpot(spot);
  const Icon = KIND_ICON[spot.kind];

  return (
    <article
      className={cn("flex flex-col gap-2", compact ? "" : "p-4")}
      onClick={onFocus}
    >
      <header className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {spot.name}
          </h3>
          {spot.nameJa && (
            <p className="truncate text-xs text-muted-foreground">
              {spot.nameJa}
            </p>
          )}
        </div>
        {custom && (
          <Badge variant="primarySoft" className="shrink-0">
            Benim
          </Badge>
        )}
        {verdict === "exists" && (
          <Badge variant="success" className="shrink-0">
            ✔ Doğru
          </Badge>
        )}
        {verdict === "missing" && (
          <Badge variant="destructive" className="shrink-0">
            ✗ Yok
          </Badge>
        )}
      </header>

      <div className="flex flex-wrap gap-1">
        <Badge variant="soft">{KIND_LABEL[spot.kind]}</Badge>
        {smokingLabel && (
          <Badge variant="primarySoft">{smokingLabel}</Badge>
        )}
        {open === true && (
          <Badge variant="success">🟢 Şu an açık</Badge>
        )}
        {open === false && (
          <Badge variant="destructive">🔴 Şu an kapalı</Badge>
        )}
        {spot.openingHours && (
          <Badge variant="soft" className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {spot.openingHours}
          </Badge>
        )}
        {distance != null && (
          <Badge variant="info" className="inline-flex items-center gap-1">
            <Footprints className="h-3 w-3" />
            {formatDistance(distance)} · {formatWalkingTime(distance)}
          </Badge>
        )}
      </div>

      {spot.address && (
        <p className="flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {spot.address}
        </p>
      )}
      {spot.raw.notes && (
        <p className="text-xs italic text-muted-foreground">
          "{spot.raw.notes}"
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button asChild size="sm">
          <a
            href={googleMapsDirUrl(spot.lat, spot.lng)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Navigation className="h-3.5 w-3.5" />
            Rota
          </a>
        </Button>
        <Button
          size="sm"
          variant={verdict === "exists" ? "success" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onVerdict(verdict === "exists" ? null : "exists");
          }}
        >
          <Check className="h-3.5 w-3.5" />
          Var
        </Button>
        <Button
          size="sm"
          variant={verdict === "missing" ? "destructive" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onVerdict(verdict === "missing" ? null : "missing");
          }}
        >
          <X className="h-3.5 w-3.5" />
          Yok
        </Button>
        {custom ? (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Bu noktayı sil?")) removeCustomSpot(spot.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Sil
          </Button>
        ) : (
          spot.osmUrl && (
            <Button asChild size="sm" variant="link" className="ml-auto px-0">
              <a
                href={spot.osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                OSM <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )
        )}
      </div>
    </article>
  );
}
