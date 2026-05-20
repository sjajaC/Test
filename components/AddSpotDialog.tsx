"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
        <h2 className="text-base font-bold text-ink">Yeni nokta ekle</h2>
        <p className="mt-1 text-xs text-smoke">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — sadece sende
          görünür (tarayıcına kaydedilir).
        </p>

        <label className="mt-3 block text-xs font-medium text-ink">
          İsim
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Shibuya istasyonu kabini"
            className="mt-1 w-full rounded-md border border-ash bg-white px-2 py-2 text-sm"
          />
        </label>

        <label className="mt-3 block text-xs font-medium text-ink">
          Tür
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SpotKind)}
            className="mt-1 w-full rounded-md border border-ash bg-white px-2 py-2 text-sm"
          >
            <option value="area">🚬 Sigara Alanı</option>
            <option value="cafe">☕ Kafe</option>
            <option value="bar">🍺 Bar / Pub</option>
            <option value="restaurant">🍽️ Restoran</option>
          </select>
        </label>

        <label className="mt-3 block text-xs font-medium text-ink">
          Not (opsiyonel)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Üst katta, kapalı kabin, vs."
            className="mt-1 w-full rounded-md border border-ash bg-white px-2 py-2 text-sm"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-ash bg-white px-3 py-2 text-sm hover:bg-ash/40"
          >
            Vazgeç
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), kind, notes: notes.trim() || undefined })}
            className="flex-1 rounded-md bg-ember px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
