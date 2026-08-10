"use client";

// Interaktives Charakterblatt-Formular.
//
// Attribute: "Standard-Array" - sechs feste Werte (15,14,13,12,10,8) werden
// auf die Eigenschaften verteilt. Wählt man einen Wert für eine Eigenschaft,
// die ihn schon woanders hat, werden die beiden Werte einfach getauscht -
// so ist immer jede Auswahl änderbar, nichts blockiert sich selbst.
//
// Kampfwerte (HP, Rüstungsklasse): werden automatisch aus Klasse,
// Konstitution/Geschicklichkeit und gewählter Ausrüstung berechnet -
// die Spieler müssen nichts selbst ausrechnen.
//
// Fertigkeiten, Ausrüstung, Zauber: offizielle Auswahllisten je nach
// Klasse, mit kurzen Erklärungen, statt Freitext.

import { useMemo, useState } from "react";
import { createCharacter } from "@/app/characters-actions";
import {
  RACES,
  CLASSES,
  CharClass,
  HIT_DICE,
  CLASS_SKILL_CHOICES,
  EQUIPMENT_PACKAGES,
  SPELLCASTING,
  abilityModifier,
} from "@/lib/dnd-data";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const ABILITIES = [
  { key: "strength", label: "Stärke", help: "Nahkampf, Tragkraft" },
  { key: "dexterity", label: "Geschicklichkeit", help: "Fernkampf, Ausweichen, Rüstungsklasse" },
  { key: "constitution", label: "Konstitution", help: "Lebenspunkte, Widerstand" },
  { key: "intelligence", label: "Intelligenz", help: "Wissen, Magier-Zauber" },
  { key: "wisdom", label: "Weisheit", help: "Wahrnehmung, Kleriker/Druide-Zauber" },
  { key: "charisma", label: "Charisma", help: "Überzeugen, Barde/Hexenmeister/Zauberer-Zauber" },
] as const;

type AbilityKey = (typeof ABILITIES)[number]["key"];

export default function CharacterForm({
  campaignId,
  isBeginner,
  houseRules,
}: {
  campaignId: string;
  isBeginner: boolean;
  houseRules: string;
}) {
  const [charClass, setCharClass] = useState<CharClass>("Krieger");
  const [assignment, setAssignment] = useState<Record<AbilityKey, number>>({
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string[]>([]);

  const skillChoice = CLASS_SKILL_CHOICES[charClass];
  const equipmentOptions = EQUIPMENT_PACKAGES[charClass];
  const equipment = equipmentOptions[equipmentIndex];
  const caster = SPELLCASTING[charClass];

  // Attribute per Tausch zuweisen: nie blockiert, immer änderbar
  function handleAssign(ability: AbilityKey, newValue: number) {
    setAssignment((prev) => {
      const swapWith = (Object.keys(prev) as AbilityKey[]).find(
        (k) => prev[k] === newValue && k !== ability
      );
      const updated = { ...prev };
      if (swapWith) updated[swapWith] = prev[ability];
      updated[ability] = newValue;
      return updated;
    });
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= skillChoice.count) return prev; // Limit erreicht
      return [...prev, skill];
    });
  }

  function toggleSpell(
    list: string[],
    setList: (v: string[]) => void,
    name: string,
    limit: number
  ) {
    if (list.includes(name)) {
      setList(list.filter((s) => s !== name));
    } else if (list.length < limit) {
      setList([...list, name]);
    }
  }

  const conMod = abilityModifier(assignment.constitution);
  const dexMod = abilityModifier(assignment.dexterity);
  const wisMod = abilityModifier(assignment.wisdom);

  // HP nach offizieller Regel: max. Trefferwürfel + Konstitutionsbonus (Stufe 1)
  const hp = Math.max(1, HIT_DICE[charClass] + conMod);

  // Rüstungsklasse: Barbar & Mönch haben eine besondere "Unarmored Defense"-Regel,
  // alle anderen richten sich nach Rüstungsart + Geschicklichkeit
  const ac = useMemo(() => {
    if (charClass === "Barbar") return 10 + dexMod + conMod;
    if (charClass === "Mönch") return 10 + dexMod + wisMod;
    let value: number;
    if (equipment.armorType === "none") value = 10 + dexMod;
    else if (equipment.armorType === "light") value = equipment.baseAc + dexMod;
    else if (equipment.armorType === "medium")
      value = equipment.baseAc + Math.min(dexMod, 2);
    else value = equipment.baseAc; // heavy: kein Dex-Bonus
    if (equipment.shield) value += 2;
    return value;
  }, [charClass, equipment, dexMod, conMod, wisMod]);

  // Alles, was in die "details" JSON-Spalte gespeichert wird
  const detailsJson = useMemo(
    () =>
      JSON.stringify({
        skills: selectedSkills,
        equipment: `${equipment.label}: ${equipment.items}`,
        cantrips: selectedCantrips,
        level1Spells: selectedLevel1,
      }),
    [selectedSkills, equipment, selectedCantrips, selectedLevel1]
  );

  return (
    <form action={createCharacter} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="hp_max" value={hp} />
      <input type="hidden" name="armor_class" value={ac} />
      <input type="hidden" name="details_json" value={detailsJson} />
      {ABILITIES.map(({ key }) => (
        <input key={key} type="hidden" name={key} value={assignment[key]} />
      ))}

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
              onChange={(e) => {
                setCharClass(e.target.value as CharClass);
                setSelectedSkills([]);
                setEquipmentIndex(0);
                setSelectedCantrips([]);
                setSelectedLevel1([]);
              }}
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
            Verteil diese 6 Werte auf deine Eigenschaften: 15, 14, 13, 12,
            10, 8. Höhere Werte bei dem, was dein Charakter gut können soll.
            Wählst du einen Wert doppelt, tauscht er einfach mit der anderen
            Eigenschaft.
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
                value={assignment[key]}
                onChange={(e) => handleAssign(key, Number(e.target.value))}
                className="rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400 w-28"
              >
                {STANDARD_ARRAY.map((v) => (
                  <option key={v} value={v}>
                    {v} ({abilityModifier(v) >= 0 ? "+" : ""}
                    {abilityModifier(v)})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Kampfwerte - automatisch berechnet */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">Kampfwerte</h2>
        <p className="text-xs text-zinc-500">
          Automatisch berechnet aus Klasse, Attributen und Ausrüstung – du
          musst hier nichts eintragen.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md bg-zinc-950 border border-zinc-800 px-4 py-3">
            <span className="text-xs text-zinc-500 block">Lebenspunkte</span>
            <span className="text-xl text-zinc-100 font-medium">{hp}</span>
            <span className="text-xs text-zinc-600 block mt-1">
              Trefferwürfel (W{HIT_DICE[charClass]}) + Konstitution
            </span>
          </div>
          <div className="rounded-md bg-zinc-950 border border-zinc-800 px-4 py-3">
            <span className="text-xs text-zinc-500 block">
              Rüstungsklasse
            </span>
            <span className="text-xl text-zinc-100 font-medium">{ac}</span>
            <span className="text-xs text-zinc-600 block mt-1">
              {charClass === "Barbar" || charClass === "Mönch"
                ? "Unbewaffnete Verteidigung"
                : `${equipment.label}`}
            </span>
          </div>
        </div>
      </div>

      {/* Fertigkeiten */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Fertigkeiten ({selectedSkills.length}/{skillChoice.count})
        </h2>
        <p className="text-xs text-zinc-500">
          Wähl {skillChoice.count} Fertigkeiten, in denen dein{" "}
          {charClass} laut Regelwerk geübt sein darf. Geübte Fertigkeiten
          geben dir später einen Bonus auf passende Würfe.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {skillChoice.options.map((skill) => {
            const checked = selectedSkills.includes(skill);
            const disabled = !checked && selectedSkills.length >= skillChoice.count;
            return (
              <label
                key={skill}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                  checked
                    ? "border-zinc-300 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800 text-zinc-300"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleSkill(skill)}
                />
                {skill}
              </label>
            );
          })}
        </div>
      </div>

      {/* Ausrüstung */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Startausrüstung
        </h2>
        <p className="text-xs text-zinc-500">
          Offizielle Ausrüstungspakete für {charClass}. Die Rüstungsklasse
          oben passt sich automatisch an deine Wahl an.
        </p>
        <div className="space-y-2">
          {equipmentOptions.map((opt, idx) => (
            <label
              key={opt.label}
              className={`flex flex-col gap-1 rounded-md border px-4 py-3 cursor-pointer ${
                equipmentIndex === idx
                  ? "border-zinc-300 bg-zinc-800"
                  : "border-zinc-800"
              }`}
            >
              <span className="flex items-center gap-2 text-zinc-100 font-medium text-sm">
                <input
                  type="radio"
                  checked={equipmentIndex === idx}
                  onChange={() => setEquipmentIndex(idx)}
                />
                {opt.label}
              </span>
              <span className="text-xs text-zinc-500">{opt.items}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Zauber - nur für Klassen, die ab Stufe 1 zaubern können */}
      {caster ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <h2 className="text-lg font-medium text-zinc-100">Zauber</h2>
          <p className="text-xs text-zinc-500">
            Als {charClass} zauberst du über {caster.ability}.{" "}
            <span className="text-zinc-400">Zaubertricks</span> sind
            unbegrenzt oft nutzbar, ohne Ressourcen zu verbrauchen. Zauber
            1. Grades verbrauchen dagegen einen deiner Zauberplätze und
            stehen dir erst nach einer Rast wieder zur Verfügung.
          </p>

          <div>
            <h3 className="text-sm text-zinc-200 mb-2">
              Zaubertricks ({selectedCantrips.length}/{caster.cantripsKnown})
            </h3>
            <div className="space-y-2">
              {caster.cantrips.map((spell) => {
                const checked = selectedCantrips.includes(spell.name);
                const disabled =
                  !checked && selectedCantrips.length >= caster.cantripsKnown;
                return (
                  <label
                    key={spell.name}
                    className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                      checked
                        ? "border-zinc-300 bg-zinc-800"
                        : "border-zinc-800"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      className="mt-1"
                      onChange={() =>
                        toggleSpell(
                          selectedCantrips,
                          setSelectedCantrips,
                          spell.name,
                          caster.cantripsKnown
                        )
                      }
                    />
                    <span>
                      <span className="text-zinc-100 font-medium">
                        {spell.name}
                      </span>
                      <span className="text-zinc-500 block text-xs">
                        {spell.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm text-zinc-200 mb-2">
              Zauber 1. Grades ({selectedLevel1.length}/{caster.level1Known})
            </h3>
            <div className="space-y-2">
              {caster.level1.map((spell) => {
                const checked = selectedLevel1.includes(spell.name);
                const disabled =
                  !checked && selectedLevel1.length >= caster.level1Known;
                return (
                  <label
                    key={spell.name}
                    className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                      checked
                        ? "border-zinc-300 bg-zinc-800"
                        : "border-zinc-800"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      className="mt-1"
                      onChange={() =>
                        toggleSpell(
                          selectedLevel1,
                          setSelectedLevel1,
                          spell.name,
                          caster.level1Known
                        )
                      }
                    />
                    <span>
                      <span className="text-zinc-100 font-medium">
                        {spell.name}
                      </span>
                      <span className="text-zinc-500 block text-xs">
                        {spell.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-1">Zauber</h2>
          <p className="text-xs text-zinc-500">
            {charClass} beherrscht auf Stufe 1 noch keine Zauber
            (Waldläufer und Paladin bekommen ihre ersten Zauber ab Stufe 2).
          </p>
        </div>
      )}

      {/* Hintergrund */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">
          Hintergrundgeschichte
        </h2>
        <textarea
          name="background"
          rows={3}
          placeholder="Wer ist dein Charakter, woher kommt er... (optional)"
          className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
        />
      </div>

      <button
        type="submit"
        disabled={selectedSkills.length !== skillChoice.count}
        className="w-full rounded-md bg-zinc-100 text-zinc-900 font-medium py-2.5 hover:bg-white transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Charakter erstellen
      </button>
      {selectedSkills.length !== skillChoice.count && (
        <p className="text-amber-400 text-xs text-center">
          Wähl noch {skillChoice.count - selectedSkills.length} Fertigkeit
          {skillChoice.count - selectedSkills.length === 1 ? "" : "en"}, um
          fortzufahren.
        </p>
      )}
    </form>
  );
}
