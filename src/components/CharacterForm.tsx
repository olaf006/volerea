"use client";

// Interaktives Charakterblatt-Formular.
// "Standard-Array" ist die einfachste D&D-5e-Methode für Attribute:
// man bekommt 6 feste Werte (15,14,13,12,10,8) und verteilt sie auf
// die 6 Eigenschaften - kein Würfeln nötig, für Einsteiger ideal.

import { useMemo, useState } from "react";
import { createCharacter } from "@/app/characters-actions";

const RACES = [
  "Mensch",
  "Elf",
  "Zwerg",
  "Halbling",
  "Halbork",
  "Halbelf",
  "Gnom",
  "Drachenblütiger",
  "Tiefling",
];

const CLASSES = [
  "Krieger",
  "Magier",
  "Kleriker",
  "Schurke",
  "Waldläufer",
  "Paladin",
  "Barbar",
  "Barde",
  "Druide",
  "Hexenmeister",
  "Mönch",
  "Zauberer",
];

// Trefferwürfel pro Klasse, für die HP-Vorschlagsberechnung
const HIT_DICE: Record<string, number> = {
  Barbar: 12,
  Krieger: 10,
  Paladin: 10,
  Waldläufer: 10,
  Kleriker: 8,
  Schurke: 8,
  Barde: 8,
  Druide: 8,
  Mönch: 8,
  Hexenmeister: 8,
  Magier: 6,
  Zauberer: 6,
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const ABILITIES = [
  { key: "strength", label: "Stärke", help: "Nahkampf, Tragkraft" },
  { key: "dexterity", label: "Geschicklichkeit", help: "Fernkampf, Ausweichen" },
  { key: "constitution", label: "Konstitution", help: "Lebenspunkte, Widerstand" },
  { key: "intelligence", label: "Intelligenz", help: "Wissen, Magier-Zauber" },
  { key: "wisdom", label: "Weisheit", help: "Wahrnehmung, Kleriker-Zauber" },
  { key: "charisma", label: "Charisma", help: "Überzeugen, Barde/Hexenmeister-Zauber" },
] as const;

function modifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export default function CharacterForm({
  campaignId,
  isBeginner,
  houseRules,
}: {
  campaignId: string;
  isBeginner: boolean;
  houseRules: string;
}) {
  const [charClass, setCharClass] = useState("Krieger");
  const [assignment, setAssignment] = useState<Record<string, number | null>>(
    {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    }
  );

  // Prüft, welche Werte aus dem Standard-Array noch übrig sind
  const usedValues = Object.values(assignment).filter(
    (v): v is number => v !== null
  );
  const remainingCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    STANDARD_ARRAY.forEach((v) => (counts[v] = (counts[v] ?? 0) + 1));
    usedValues.forEach((v) => (counts[v] = (counts[v] ?? 0) - 1));
    return counts;
  }, [usedValues]);

  const allAssigned = usedValues.length === 6;

  const suggestedHp =
    HIT_DICE[charClass] + modifier(assignment.constitution ?? 10);
  const suggestedAc = 10 + modifier(assignment.dexterity ?? 10);

  function handleAssign(ability: string, value: number) {
    setAssignment((prev) => ({ ...prev, [ability]: value }));
  }

  return (
    <form action={createCharacter} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />

      {isBeginner && (
        <div className="rounded-md border border-emerald-900 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          Anfänger-Modus: Bei jedem Schritt bekommst du kurze Erklärungen.
          Wähl einfach aus, was dir gefällt – nichts kann hier kaputt gehen.
        </div>
      )}

      {houseRules && (
        <div className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          <span className="text-zinc-100 font-medium">Hausregeln: </span>
          {houseRules}
        </div>
      )}

      {/* Grunddaten */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Grunddaten</h2>

        <div>
          <label className="block text-sm text-zinc-300 mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Name deines Charakters"
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Rasse</label>
            <select
              name="race"
              required
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            >
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Klasse</label>
            <select
              name="class"
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isBeginner && (
          <p className="text-xs text-zinc-500">
            Die Klasse bestimmt, wie dein Charakter kämpft (z.B. Krieger =
            stark im Nahkampf, Magier = Zauber statt Schwert).
          </p>
        )}
      </div>

      {/* Attribute */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Attribute</h2>
        {isBeginner && (
          <p className="text-xs text-zinc-500">
            Verteil diese 6 Werte auf deine Eigenschaften, ganz wie du
            möchtest: 15, 14, 13, 12, 10, 8. Höhere Werte bei dem, was dein
            Charakter gut können soll.
          </p>
        )}

        <div className="space-y-3">
          {ABILITIES.map(({ key, label, help }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-zinc-100 text-sm">{label}</span>
                {isBeginner && (
                  <span className="text-zinc-500 text-xs block">{help}</span>
                )}
              </div>
              <select
                name={key}
                value={assignment[key] ?? ""}
                onChange={(e) => handleAssign(key, Number(e.target.value))}
                required
                className="rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400 w-24"
              >
                {STANDARD_ARRAY.filter(
                  (v, idx, arr) => arr.indexOf(v) === idx
                ).map((v) => {
                  const isCurrentlySelected = assignment[key] === v;
                  const available =
                    (remainingCounts[v] ?? 0) > 0 || isCurrentlySelected;
                  return (
                    <option key={v} value={v} disabled={!available}>
                      {v} ({modifier(v) >= 0 ? "+" : ""}
                      {modifier(v)})
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>

        {!allAssigned && (
          <p className="text-amber-400 text-xs">
            Tipp: jeder Wert aus 15/14/13/12/10/8 sollte genau einmal
            vergeben sein.
          </p>
        )}
      </div>

      {/* Kampfwerte */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Kampfwerte</h2>
        {isBeginner && (
          <p className="text-xs text-zinc-500">
            Hier ein Vorschlag basierend auf deiner Klasse und Konstitution –
            du kannst die Zahlen aber auch anpassen (z.B. wenn dein Meister
            andere Regeln nutzt).
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Lebenspunkte (max)
            </label>
            <input
              type="number"
              name="hp_max"
              defaultValue={suggestedHp}
              key={suggestedHp}
              required
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Rüstungsklasse (AC)
            </label>
            <input
              type="number"
              name="armor_class"
              defaultValue={suggestedAc}
              key={"ac" + suggestedAc}
              required
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Hintergrund */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">
          Hintergrund & Ausrüstung
        </h2>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">
            Hintergrundgeschichte (optional)
          </label>
          <textarea
            name="background"
            rows={3}
            placeholder="Wer ist dein Charakter, woher kommt er..."
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">
            Fertigkeiten (optional)
          </label>
          <input
            type="text"
            name="skills"
            placeholder="z.B. Heimlichkeit, Überzeugen, Wahrnehmung"
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">
            Ausrüstung (optional)
          </label>
          <textarea
            name="equipment"
            rows={2}
            placeholder="Waffen, Rüstung, Gegenstände..."
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-300 mb-1">
            Zauber (optional, falls deine Klasse zaubern kann)
          </label>
          <textarea
            name="spells"
            rows={2}
            placeholder="Bekannte Zauber..."
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-zinc-100 text-zinc-900 font-medium py-2.5 hover:bg-white transition"
      >
        Charakter erstellen
      </button>
    </form>
  );
}
