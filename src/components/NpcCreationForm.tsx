"use client";

// NPC-Erstellung: Vorlage aus der Monster-Liste wählen (füllt HP, Waffe,
// Loot automatisch aus) oder komplett frei eintragen. Alles danach noch
// änderbar. Landet erstmal in der Liste, nicht sofort auf der Karte.

import { useState } from "react";
import { createToken } from "@/app/tokens-actions";
import { MONSTER_TEMPLATES } from "@/lib/dnd-data";

export default function NpcCreationForm({
  campaignId,
  mapId,
  alwaysOpen,
}: {
  campaignId: string;
  mapId: string;
  alwaysOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!alwaysOpen);
  const [templateIdx, setTemplateIdx] = useState(-1);
  const [label, setLabel] = useState("");
  const [hpMax, setHpMax] = useState("");
  const [weaponName, setWeaponName] = useState("");
  const [weaponDamage, setWeaponDamage] = useState("");
  const [loot, setLoot] = useState("");

  function applyTemplate(idx: number) {
    setTemplateIdx(idx);
    if (idx === -1) return;
    const t = MONSTER_TEMPLATES[idx];
    setLabel(t.name);
    setHpMax(String(t.hp));
    setWeaponName(t.weaponName);
    setWeaponDamage(t.weaponDamage);
    setLoot(t.loot);
  }

  function reset() {
    setTemplateIdx(-1);
    setLabel("");
    setHpMax("");
    setWeaponName("");
    setWeaponDamage("");
    setLoot("");
    if (!alwaysOpen) setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1.5 font-medium hover:bg-white transition"
      >
        + NPC erstellen
      </button>
    );
  }

  return (
    <form
      action={createToken}
      onSubmit={reset}
      className="space-y-2 border border-zinc-700 rounded-md p-2"
    >
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="map_id" value={mapId} />

      <select
        value={templateIdx}
        onChange={(e) => applyTemplate(Number(e.target.value))}
        className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
      >
        <option value={-1}>Eigene Kreatur (frei eintragen)</option>
        {MONSTER_TEMPLATES.map((t, idx) => (
          <option key={t.name} value={idx}>
            {t.name} ({t.hp} HP)
          </option>
        ))}
      </select>

      <input
        type="text"
        name="label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Name"
        required
        className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
      />

      <div className="flex gap-2">
        <input
          type="number"
          name="hp_max"
          value={hpMax}
          onChange={(e) => setHpMax(e.target.value)}
          placeholder="HP"
          className="w-16 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        />
        <input
          type="text"
          name="weapon_name"
          value={weaponName}
          onChange={(e) => setWeaponName(e.target.value)}
          placeholder="Waffe"
          className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        />
        <input
          type="text"
          name="weapon_damage"
          value={weaponDamage}
          onChange={(e) => setWeaponDamage(e.target.value)}
          placeholder="1W6"
          className="w-16 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        />
      </div>

      <input
        type="text"
        name="loot"
        value={loot}
        onChange={(e) => setLoot(e.target.value)}
        placeholder="Loot (optional)"
        className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
      />

      <input
        type="file"
        name="file"
        accept="image/*"
        className="w-full text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:px-2 file:py-1"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1.5 font-medium hover:bg-white transition"
        >
          Anlegen
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs rounded-md border border-zinc-700 text-zinc-300 px-3 py-1.5 hover:bg-zinc-800"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
