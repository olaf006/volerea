"use client";

// Bearbeitbare Lebenspunkte mit +/- Buttons. Speichert direkt, ohne
// Formular-Umweg, damit es sich im Kampf schnell anpassen lässt.

import { useState, useTransition } from "react";
import { updateCharacterHp } from "@/app/combat-actions";

export default function HpEditor({
  characterId,
  campaignId,
  hpCurrent,
  hpMax,
}: {
  characterId: string;
  campaignId: string;
  hpCurrent: number;
  hpMax: number;
}) {
  const [value, setValue] = useState(hpCurrent);
  const [isPending, startTransition] = useTransition();

  function save(next: number) {
    const clamped = Math.max(0, Math.min(hpMax, next));
    setValue(clamped);
    const formData = new FormData();
    formData.set("character_id", characterId);
    formData.set("campaign_id", campaignId);
    formData.set("hp_current", String(clamped));
    startTransition(() => {
      updateCharacterHp(formData);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => save(value - 1)}
        disabled={isPending}
        className="w-7 h-7 rounded-md border border-tavern-700 text-zinc-300 hover:bg-tavern-800 transition"
      >
        −
      </button>
      <span className="text-xl text-zinc-100 font-medium tabular-nums w-16 text-center">
        {value} / {hpMax}
      </span>
      <button
        onClick={() => save(value + 1)}
        disabled={isPending}
        className="w-7 h-7 rounded-md border border-tavern-700 text-zinc-300 hover:bg-tavern-800 transition"
      >
        +
      </button>
    </div>
  );
}
