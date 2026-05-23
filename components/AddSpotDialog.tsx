"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import type { SpotKind } from "@/lib/types";

interface Props {
  coords: { lat: number; lng: number };
  onCancel: () => void;
  onSave: (data: { name: string; kind: SpotKind; notes?: string }) => void;
}

export default function AddSpotDialog({ coords, onCancel, onSave }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<SpotKind>("area");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni nokta ekle</DialogTitle>
          <DialogDescription>
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — sadece sende
            görünür (tarayıcına kaydedilir).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="spot-name">İsim</Label>
            <Input
              id="spot-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Shibuya istasyonu kabini"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Tür</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as SpotKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">🚬 Sigara Alanı</SelectItem>
                <SelectItem value="cafe">☕ Kafe</SelectItem>
                <SelectItem value="bar">🍺 Bar / Pub</SelectItem>
                <SelectItem value="restaurant">🍽️ Restoran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="spot-notes">Not (opsiyonel)</Label>
            <Textarea
              id="spot-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Üst katta, kapalı kabin, vs."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Vazgeç
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                kind,
                notes: notes.trim() || undefined,
              })
            }
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
