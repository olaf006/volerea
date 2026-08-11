"use client";

// Stufenaufstieg: Lebenspunkte werden ECHT gewürfelt (serverseitig, damit
// nicht manipuliert werden kann) - so wie es die Regeln vorsehen, nicht
// über einen Durchschnittswert. Bei Stufe 4/8/12/16/19 gibt's eine
// Attributssteigerung. Zauberklassen dürfen optional einen neuen Zauber
// aus der bekannten Liste dazulernen.

import { useMemo, useState } from "react";
import { levelUpCharacter, rollHitDie } from "@/app/characters-actions";
import {
  HIT_DICE,
  CharClass,
  AbilityKeyName,
  ABILITY_GERMAN,
  abilityModifier,
  proficiencyBonus,
  SPELLCASTING,
} from "@/lib/dnd-data";

const ASI_LEVELS = [4, 8, 12, 16, 19];
const ABILITY_KEYS: AbilityKeyName[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

export default function LevelUpForm({
  campaignId,
  characterId,
  charClass,
  currentLevel,
  currentAbilities,
  currentDetails,
}: {
  campaignId: string;
  characterId: string;
  charClass: CharClass;
  currentLevel: number;
  currentAbilities: Record<AbilityKeyName, number>;
  currentDetails: {
    cantrips?: string[];
    level1Spells?: string[];
  };
}) {
  const newLevel = currentLevel + 1;
  const isAsiLevel = ASI_LEVELS.includes(newLevel);

  const hitDie = HIT_DICE[charClass];
  const conMod = abilityModifier(currentAbilities.constitution);

  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const hpGain = hpRoll !== null ? Math.max(1, hpRoll + conMod) : null;

  async function rollForHp() {
    setRolling(true);
    const result = await rollHitDie(hitDie);
    setHpRoll(result);
    setRolling(false);
  }

  const newProfBonus = proficiencyBonus(newLevel);

  const [asiMode, setAsiMode] = useState<"one" | "two">("one");
  const [plusTwoAbility, setPlusTwoAbility] = useState<AbilityKeyName>("strength");
  const [plusOneA, setPlusOneA] = useState<AbilityKeyName>("strength");
  const [plusOneB, setPlusOneB] = useState<AbilityKeyName>("dexterity");

  const caster = SPELLCASTING[charClass];
  const knownCantrips = currentDetails.cantrips ?? [];
  const knownLevel1 = currentDetails.level1Spells ?? [];
  const availableCantrips = caster?.cantrips.filter((c) => !knownCantrips.includes(c.name)) ?? [];
  const availableLevel1 = caster?.level1.filter((s) => !knownLevel1.includes(s.name)) ?? [];

  const [newCantrip, setNewCantrip] = useState("");
  const [newSpell, setNewSpell] = useState("");

  const finalAbilities = useMemo(() => {
    const result = { ...currentAbilities };
    if (isAsiLevel) {
      if (asiMode === "one") {
        result[plusTwoAbility] = Math.min(20, result[plusTwoAbility] + 2);
      } else {
        result[plusOneA] = Math.min(20, result[plusOneA] + 1);
        result[plusOneB] = Math.min(20, result[plusOneB] + 1);
      }
    }
    return result;
  }, [currentAbilities, isAsiLevel, asiMode, plusTwoAbility, plusOneA, plusOneB]);

  function handleSubmit(formData: FormData) {
    if (hpGain === null) return;
    formData.set("character_id", characterId);
    formData.set("campaign_id", campaignId);
    formData.set("new_level", String(newLevel));
    formData.set("hp_gain", String(hpGain));
    formData.set("proficiency_bonus", String(newProfBonus));
    formData.set("abilities_json", JSON.stringify(finalAbilities));

    const newDetails: Record<string, unknown> = {};
    if (newCantrip) newDetails.cantrips = [...knownCantrips, newCantrip];
    if (newSpell) newDetails.level1Spells = [...knownLevel1, newSpell];
    formData.set("details_json", JSON.stringify(newDetails));

    return levelUpCharacter(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="text-center">
        <span className="text-2xl text-zinc-100 font-semibold">
          Stufe {currentLevel} → {newLevel}
        </span>
      </div>

      <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
        <span className="text-xs text-zinc-500 block mb-2">Lebenspunkte</span>
        {hpGain === null ? (
          <button
            type="button"
            onClick={rollForHp}
            disabled={rolling}
            className="w-full rounded-md border border-tavern-700 text-zinc-100 py-2 hover:bg-tavern-800 transition disabled:opacity-50"
          >
            {rolling ? "…" : `Trefferwürfel würfeln (W${hitDie})`}
          </button>
        ) : (
          <span className="text-zinc-100 font-medium">
            +{hpGain} (gewürfelt: {hpRoll} auf W{hitDie}, {conMod >= 0 ? "+" : ""}
            {conMod} Konstitution)
          </span>
        )}
      </div>

      <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
        <span className="text-xs text-zinc-500 block">Übungsbonus</span>
        <span className="text-zinc-100 font-medium">+{newProfBonus}</span>
      </div>

      {isAsiLevel && (
        <div className="rounded-md border border-tavern-800 bg-tavern-900 p-4 space-y-3">
          <h3 className="text-sm font-medium text-zinc-100">
            Attributssteigerung (Stufe {newLevel})
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                checked={asiMode === "one"}
                onChange={() => setAsiMode("one")}
              />
              +2 auf ein Attribut
            </label>
            {asiMode === "one" && (
              <select
                value={plusTwoAbility}
                onChange={(e) => setPlusTwoAbility(e.target.value as AbilityKeyName)}
                className="ml-6 rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm w-fit"
              >
                {ABILITY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ABILITY_GERMAN[k]} ({currentAbilities[k]} → {Math.min(20, currentAbilities[k] + 2)})
                  </option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                checked={asiMode === "two"}
                onChange={() => setAsiMode("two")}
              />
              +1 auf zwei Attribute
            </label>
            {asiMode === "two" && (
              <div className="ml-6 flex gap-2">
                <select
                  value={plusOneA}
                  onChange={(e) => setPlusOneA(e.target.value as AbilityKeyName)}
                  className="rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
                >
                  {ABILITY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {ABILITY_GERMAN[k]}
                    </option>
                  ))}
                </select>
                <select
                  value={plusOneB}
                  onChange={(e) => setPlusOneB(e.target.value as AbilityKeyName)}
                  className="rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
                >
                  {ABILITY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {ABILITY_GERMAN[k]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {caster && (availableCantrips.length > 0 || availableLevel1.length > 0) && (
        <div className="rounded-md border border-tavern-800 bg-tavern-900 p-4 space-y-3">
          <h3 className="text-sm font-medium text-zinc-100">
            Neuen Zauber dazulernen (optional)
          </h3>
          {availableCantrips.length > 0 && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Zaubertrick</label>
              <select
                value={newCantrip}
                onChange={(e) => setNewCantrip(e.target.value)}
                className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
              >
                <option value="">Keinen dazulernen</option>
                {availableCantrips.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {availableLevel1.length > 0 && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Zauber 1. Grades</label>
              <select
                value={newSpell}
                onChange={(e) => setNewSpell(e.target.value)}
                className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
              >
                <option value="">Keinen dazulernen</option>
                {availableLevel1.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={hpGain === null}
        className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium py-2.5 hover:bg-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Stufe {newLevel} bestätigen
      </button>
      {hpGain === null && (
        <p className="text-amber-400 text-xs text-center">
          Erst den Trefferwürfel würfeln, um fortzufahren.
        </p>
      )}
    </form>
  );
}
