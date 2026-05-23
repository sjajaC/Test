"use client";

import {
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Settings2,
  X,
  Trash2,
  Cigarette,
  Coffee,
  Beer,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
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
  openNow: boolean;
  setOpenNow: (v: boolean) => void;

  totalCount: number;
  filteredCount: number;
  fetchedAt: number | null;
  loading: boolean;
  onRefresh: () => void;

  hasUserLocation: boolean;
  locating: boolean;
  locateError: string | null;
  onLocate: () => void;

  compassMode: boolean;
  onToggleCompass: () => void;
  compassError: string | null;

  verdictExists: number;
  verdictMissing: number;
  onClearVerdicts: () => void;

  addMode: boolean;
  onCancelAddMode: () => void;
}

const FILTER_OPTIONS: Array<{ value: Filter; label: string; icon?: React.ComponentType<{ className?: string }> }> = [
  { value: "all", label: "Hepsi" },
  { value: "area", label: "Alan", icon: Cigarette },
  { value: "cafe", label: "Kafe", icon: Coffee },
  { value: "bar", label: "Bar", icon: Beer },
  { value: "restaurant", label: "Restoran", icon: UtensilsCrossed },
];

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
    openNow,
    setOpenNow,
    totalCount,
    filteredCount,
    fetchedAt,
    loading,
    onRefresh,
    hasUserLocation,
    locating,
    locateError,
    onLocate,
    compassMode,
    onToggleCompass,
    compassError,
    verdictExists,
    verdictMissing,
    onClearVerdicts,
    addMode,
    onCancelAddMode,
  } = props;

  return (
    <header className="z-10 border-b bg-background pt-[env(safe-area-inset-top)] shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-1.5 text-sm font-bold">
            🇯🇵 <span>Smoke.JP</span>
          </h1>
          <p className="truncate text-[10px] text-muted-foreground">
            {filteredCount}/{totalCount} nokta
            {fetchedAt &&
              ` · ${new Date(fetchedAt).toLocaleDateString("tr-TR")}`}
          </p>
        </div>

        <Select value={cityId} onValueChange={setCityId}>
          <SelectTrigger className="h-9 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.nameJa})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={hasUserLocation ? "default" : "outline"}
          size="icon"
          onClick={onLocate}
          disabled={locating}
          title="Konumum"
        >
          <MapPin className={cn("h-4 w-4", locating && "animate-pulse")} />
        </Button>

        <Button
          variant={compassMode ? "default" : "outline"}
          size="icon"
          onClick={onToggleCompass}
          title="Pusula modu"
          className={compassMode ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          <Compass className="h-4 w-4" />
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" title="Filtreler">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtreler &amp; Ayarlar</SheetTitle>
              <SheetDescription>
                Tür, açıklık ve görünür noktaları yönet.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="search">Arama</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="İsim veya adres..."
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Tür</Label>
                <div className="flex flex-wrap gap-1">
                  {FILTER_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <Toggle
                        key={opt.value}
                        size="sm"
                        variant="outline"
                        pressed={filter === opt.value}
                        onPressedChange={() => setFilter(opt.value)}
                      >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {opt.label}
                      </Toggle>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">🟢 Sadece şu an açık</Label>
                  <p className="text-xs text-muted-foreground">
                    OSM açılış saatlerine göre filtreler.
                  </p>
                </div>
                <Switch checked={openNow} onCheckedChange={setOpenNow} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label className="text-sm">"Yok" işaretlileri gizle</Label>
                  <p className="text-xs text-muted-foreground">
                    Doğrulamadığın noktaları sakla.
                  </p>
                </div>
                <Switch checked={hideMissing} onCheckedChange={setHideMissing} />
              </div>

              {(verdictExists > 0 || verdictMissing > 0) && (
                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm">İşaretlerin</Label>
                    <p className="text-xs text-muted-foreground">
                      ✔ {verdictExists} doğrulandı · ✗ {verdictMissing}{" "}
                      gizlendi
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={onClearVerdicts}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Temizle
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                {loading ? "Yükleniyor..." : "Veriyi yeniden çek"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {(locateError || compassError) && (
        <p className="px-3 pb-1.5 text-[11px] text-destructive">
          ⚠ {locateError || compassError}
        </p>
      )}

      {addMode && (
        <div className="flex items-center gap-2 border-t border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] text-purple-900">
          <span>➕ Harita üzerine dokunarak yeni nokta ekle.</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 px-2 text-purple-900 hover:bg-purple-200"
            onClick={onCancelAddMode}
          >
            <X className="h-3.5 w-3.5" />
            Vazgeç
          </Button>
        </div>
      )}
    </header>
  );
}
