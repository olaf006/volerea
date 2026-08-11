"use client";

// Spielerliste für den Meister: Klick auf einen Spieler öffnet ein Popup
// mit den vollen Charakterdaten (Attribute, Kampfwerte, Inventar, XP).

import { useState } from "react";
import { abilityModifier, InventoryItem, xpForNextLevel } from "@/lib/dnd-data";
import { addXp } from "@/app/characters-actions";

interface CharacterFull {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  xp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp_current: number;
  hp_max: number;
  armor_class: number;
  details: Record<string, unknown> | null;
}

interface PlayerRow {
  userId: string;
  username: string;
  character: CharacterFull | null;
}

const ABILITY_LABELS: { key: keyof CharacterFull; label: string }[] = [
  { key: "strength", label: "Stärke" },
  { key: "dexterity", label: "Geschicklichkeit" },
  { key: "constitution", label: "Konstitution" },
  { key: "intelligence", label: "Intelligenz" },
  { key: "wisdom", label: "Weisheit" },
  { key: "charisma", label: "Charisma" },
];

export default function PlayerListPopup({
  players,
  campaignId,
}: {
  players: PlayerRow[];
  campaignId: string;
}) {
  const [selected, setSelected] = useState<PlayerRow | null>(null);
  const [xpInput, setXpInput] = useState("");

  return (
    <>
      <div className="space-y-2">
        {players.length === 0 && (
          <p className="text-zinc-500 text-sm">Noch keine Spieler in der Gruppe.</p>
        )}
        {players.map((p) => (
          <button
            key={p.userId}
            onClick={() => setSelected(p)}
            className="w-full flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-800/50 transition text-left"
          >
            <span className="text-zinc-200">{p.username}</span>
            <span className="text-zinc-500 text-xs">
              {p.character
                ? `${p.character.name} · Stufe ${p.character.level}`
                : "Kein Charakter"}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {selected.character?.name ?? selected.username}
                </h3>
                {selected.character && (
                  <p className="text-zinc-500 text-sm">
                    {selected.character.race} {selected.character.class}, Stufe{" "}
                    {selected.character.level}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                Schließen
              </button>
            </div>

            {!selected.character ? (
              <p className="text-zinc-400 text-sm">
                {selected.username} hat noch keinen Charakter erstellt.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2">
                  <span className="text-xs text-zinc-500 block">Erfahrungspunkte</span>
                  <span className="text-zinc-100 font-medium">
                    {selected.character.xp}
                    {xpForNextLevel(selected.character.level) !== null &&
                      ` / ${xpForNextLevel(selected.character.level)} für Stufe ${
                        selected.character.level + 1
                      }`}
                  </span>
                  <form
                    action={addXp}
                    onSubmit={() => setXpInput("")}
                    className="flex gap-2 mt-2"
                  >
                    <input type="hidden" name="character_id" value={selected.character.id} />
                    <input type="hidden" name="campaign_id" value={campaignId} />
                    <input
                      type="number"
                      name="amount"
                      value={xpInput}
                      onChange={(e) => setXpInput(e.target.value)}
                      placeholder="XP"
                      className="w-24 rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-100 text-sm"
                    />
                    <button
                      type="submit"
                      className="text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1.5 font-medium hover:bg-white transition"
                    >
                      XP hinzufügen
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="text-xs text-zinc-500 block">
                      Lebenspunkte
                    </span>
                    <span className="text-zinc-100 font-medium">
                      {selected.character.hp_current} / {selected.character.hp_max}
                    </span>
                  </div>
                  <div className="rounded-md bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <span className="text-xs text-zinc-500 block">
                      Rüstungsklasse
                    </span>
                    <span className="text-zinc-100 font-medium">
                      {selected.character.armor_class}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ABILITY_LABELS.map(({ key, label }) => {
                    const score = Number(selected.character![key]);
                    const mod = abilityModifier(score);
                    return (
                      <div
                        key={key}
                        className="rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1.5 text-center"
                      >
                        <span className="text-xs text-zinc-500 block">
                          {label}
                        </span>
                        <span className="text-zinc-100 text-sm font-medium">
                          {score} ({mod >= 0 ? "+" : ""}
                          {mod})
                        </span>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const details = selected.character.details ?? {};
                  const inventory = (details.inventory as InventoryItem[]) ?? [];
                  const currency = (details.currency as {
                    gold: number;
                    silver: number;
                    copper: number;
                  }) ?? { gold: 0, silver: 0, copper: 0 };
                  return (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-100 mb-2">
                        Inventar
                      </h4>
                      <p className="text-xs text-zinc-500 mb-2">
                        {currency.gold} GS, {currency.silver} SS,{" "}
                        {currency.copper} KS
                      </p>
                      <div className="space-y-1">
                        {inventory.length === 0 && (
                          <p className="text-zinc-500 text-xs">Leer.</p>
                        )}
                        {inventory.map((item, idx) => (
                          <div key={idx} className="text-xs text-zinc-300">
                            {item.qty > 1 ? `${item.qty}× ` : ""}
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
