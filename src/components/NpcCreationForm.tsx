"use client";

// NPC-Erstellung: Vorlage aus der Monster-Liste wählen - HP, Rüstungsklasse
// und Loot füllen sich automatisch, die Waffen-Auswahl zeigt nur Waffen,
// die zu genau dieser Kreatur passen (kein Freitext nötig). Wechselt man
// die Waffe, passt sich der Schadenswürfel automatisch mit an.

import { useState } from "react";
import { createToken } from "@/app/tokens-actions";
import { MONSTER_TEMPLATES } from "@/lib/dnd-data";

const CUSTOM_WEAPON_OPTIONS = [
  { name: "Dolch", damage: "1W4" },
  { name: "Kurzschwert", damage: "1W6" },
  { name: "Langschwert", damage: "1W8" },
  { name: "Großaxt", damage: "1W12" },
  { name: "Biss", damage: "1W6" },
  { name: "Kralle", damage: "1W4" },
  { name: "Fauststoß", damage: "1W4" },
];

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
  const [ac, setAc] = useState("");
  const [weaponIdx, setWeaponIdx] = useState(0);
  const [loot, setLoot] = useState("");

  const weaponOptions =
    templateIdx === -1 ? CUSTOM_WEAPON_OPTIONS : MONSTER_TEMPLATES[templateIdx].weapons;
  const selectedWeapon = weaponOptions[weaponIdx] ?? weaponOptions[0];

  function applyTemplate(idx: number) {
    setTemplateIdx(idx);
    setWeaponIdx(0);
    if (idx === -1) {
      setLabel("");
      setHpMax("");
      setAc("");
      setLoot("");
      return;
    }
    const t = MONSTER_TEMPLATES[idx];
    setLabel(t.name);
    setHpMax(String(t.hp));
    setAc(String(t.ac));
    setLoot(t.loot);
  }

  function reset() {
    setTemplateIdx(-1);
    setLabel("");
    setHpMax("");
    setAc("");
    setWeaponIdx(0);
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
      <input type="hidden" name="weapon_name" value={selectedWeapon?.name ?? ""} />
      <input type="hidden" name="weapon_damage" value={selectedWeapon?.damage ?? ""} />

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Vorlage</label>
        <select
          value={templateIdx}
          onChange={(e) => applyTemplate(Number(e.target.value))}
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        >
          <option value={-1}>Eigene Kreatur</option>
          {MONSTER_TEMPLATES.map((t, idx) => (
            <option key={t.name} value={idx}>
              {t.name} ({t.hp} HP)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Name</label>
        <input
          type="text"
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">HP</label>
          <input
            type="number"
            name="hp_max"
            value={hpMax}
            onChange={(e) => setHpMax(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Rüstungsklasse</label>
          <input
            type="number"
            name="ac"
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1">
          Waffe {templateIdx === -1 && "(allgemeine Auswahl)"}
        </label>
        <select
          value={weaponIdx}
          onChange={(e) => setWeaponIdx(Number(e.target.value))}
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        >
          {weaponOptions.map((w, idx) => (
            <option key={w.name} value={idx}>
              {w.name} ({w.damage})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Loot</label>
        <input
          type="text"
          name="loot"
          value={loot}
          onChange={(e) => setLoot(e.target.value)}
          placeholder="optional"
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-xs"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Bild (optional)</label>
        <input
          type="file"
          name="file"
          accept="image/*"
          className="w-full text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:px-2 file:py-1"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1.5 font-medium hover:bg-white transition"
        >
          Anlegen (erscheint mittig auf der Karte)
        </button>
        {!alwaysOpen && (
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md border border-zinc-700 text-zinc-300 px-3 py-1.5 hover:bg-zinc-800"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
