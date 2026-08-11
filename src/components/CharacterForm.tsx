"use client";

// Interaktives Charakterblatt-Formular nach den 2024-Regeln.
//
// Reihenfolge (wie im offiziellen Regelwerk empfohlen):
// 1. Klasse & Rasse wählen
// 2. Hintergrund wählen -> gibt Attributsboni, 2 Fertigkeiten, 1 Werkzeug,
//    Ausrüstung und ein Ursprungstalent
// 3. Attribute per Standard-Array verteilen (Basis, ohne Hintergrund-Bonus)
// 4. Kampfwerte werden automatisch berechnet (inkl. Hintergrund-Boni)
// 5. Fertigkeiten der Klasse wählen
// 6. Ausrüstung der Klasse wählen
// 7. Zauber wählen (falls zauberkundige Klasse)

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
  BACKGROUNDS,
  ORIGIN_FEATS,
  ABILITY_GERMAN,
  AbilityKeyName,
  abilityModifier,
  CLASS_FEATURES,
  FIGHTING_STYLES,
  DIVINE_ORDERS,
  PRIMAL_ORDERS,
  SAVING_THROW_PROFICIENCIES,
  proficiencyBonus,
  parseEquipmentString,
  carryingCapacity,
  weaponDisplay,
  WEAPON_DAMAGE,
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
  const [assignment, setAssignment] = useState<Record<AbilityKeyName, number>>({
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  });

  const [backgroundIdx, setBackgroundIdx] = useState(0);
  const background = BACKGROUNDS[backgroundIdx];
  const feat = ORIGIN_FEATS[background.featKey];

  // ASI-Verteilung des Hintergrunds: entweder +2/+1 auf zwei der drei
  // Attribute, oder +1 auf alle drei
  const [asiMode, setAsiMode] = useState<"twoOne" | "allOne">("twoOne");
  const [plusTwoAbility, setPlusTwoAbility] = useState<AbilityKeyName>(
    background.abilities[0]
  );

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string[]>([]);
  const [fightingStyle, setFightingStyle] = useState(FIGHTING_STYLES[0].name);
  const [divineOrder, setDivineOrder] = useState(DIVINE_ORDERS[0].name);
  const [primalOrder, setPrimalOrder] = useState(PRIMAL_ORDERS[0].name);

  const skillChoice = CLASS_SKILL_CHOICES[charClass];
  const equipmentOptions = EQUIPMENT_PACKAGES[charClass];
  const equipment = equipmentOptions[equipmentIndex];
  const caster = SPELLCASTING[charClass];

  // Attribute per Tausch zuweisen: nie blockiert, immer änderbar
  function handleAssign(ability: AbilityKeyName, newValue: number) {
    setAssignment((prev) => {
      const swapWith = (Object.keys(prev) as AbilityKeyName[]).find(
        (k) => prev[k] === newValue && k !== ability
      );
      const updated = { ...prev };
      if (swapWith) updated[swapWith] = prev[ability];
      updated[ability] = newValue;
      return updated;
    });
  }

  function selectBackground(idx: number) {
    setBackgroundIdx(idx);
    setPlusTwoAbility(BACKGROUNDS[idx].abilities[0]);
    setAsiMode("twoOne");
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= skillChoice.count) return prev;
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

  // Attributsboni aus dem Hintergrund berechnen
  const bgBonus: Record<AbilityKeyName, number> = useMemo(() => {
    const bonus: Record<AbilityKeyName, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };
    if (asiMode === "allOne") {
      background.abilities.forEach((a) => (bonus[a] = 1));
    } else {
      background.abilities.forEach((a) => {
        bonus[a] = a === plusTwoAbility ? 2 : 1;
      });
      // die dritte, nicht gewählte Fähigkeit bekommt 0 statt 1
      const untouched = background.abilities.find(
        (a) => a !== plusTwoAbility
      );
      // eine der beiden "Rest"-Fähigkeiten muss 0 bekommen (2/1/0 statt 2/1/1)
      if (untouched) {
        const secondUntouched = background.abilities.filter(
          (a) => a !== plusTwoAbility
        )[1];
        if (secondUntouched) bonus[secondUntouched] = 0;
      }
    }
    return bonus;
  }, [asiMode, plusTwoAbility, background]);

  // Finale Attributswerte = Standard-Array-Basis + Hintergrund-Bonus
  const finalScores: Record<AbilityKeyName, number> = useMemo(() => {
    const result = {} as Record<AbilityKeyName, number>;
    (Object.keys(assignment) as AbilityKeyName[]).forEach((k) => {
      result[k] = Math.min(20, assignment[k] + bgBonus[k]);
    });
    return result;
  }, [assignment, bgBonus]);

  const conMod = abilityModifier(finalScores.constitution);
  const dexMod = abilityModifier(finalScores.dexterity);
  const wisMod = abilityModifier(finalScores.wisdom);

  const toughBonus = feat.key === "tough" ? 2 : 0; // Stufe 1: +2×Stufe

  // HP nach offizieller Regel: max. Trefferwürfel + Konstitutionsbonus + Zäh-Talent
  const hp = Math.max(1, HIT_DICE[charClass] + conMod + toughBonus);

  // Rüstungsklasse: Barbar & Mönch haben "Unbewaffnete Verteidigung"
  const ac = useMemo(() => {
    if (charClass === "Barbar") return 10 + dexMod + conMod;
    if (charClass === "Mönch") return 10 + dexMod + wisMod;
    let value: number;
    if (equipment.armorType === "none") value = 10 + dexMod;
    else if (equipment.armorType === "light") value = equipment.baseAc + dexMod;
    else if (equipment.armorType === "medium")
      value = equipment.baseAc + Math.min(dexMod, 2);
    else value = equipment.baseAc;
    if (equipment.shield) value += 2;
    // Kampfstil "Verteidigung": +1 RK, solange Rüstung getragen wird
    if (
      charClass === "Krieger" &&
      fightingStyle === "Verteidigung" &&
      equipment.armorType !== "none"
    ) {
      value += 1;
    }
    return value;
  }, [charClass, equipment, dexMod, conMod, wisMod, fightingStyle]);

  const classFeatures = CLASS_FEATURES[charClass];
  const profBonus = proficiencyBonus(1);
  const savingProficiencies = SAVING_THROW_PROFICIENCIES[charClass];

  const inventory = useMemo(
    () => [
      ...parseEquipmentString(equipment.items),
      ...parseEquipmentString(background.equipment),
    ],
    [equipment, background]
  );
  const totalWeight = inventory.reduce((sum, i) => sum + i.qty * i.weight, 0);
  const capacity = carryingCapacity(finalScores.strength);

  // Wie viele einhändige Nahkampfwaffen in der Ausrüstung sind (für den
  // Kampfstil "Duellieren", der nur gilt, wenn man keine Zweitwaffe führt)
  const oneHandedWeaponCount = useMemo(() => {
    return inventory.reduce((count, item) => {
      const lower = item.name.toLowerCase();
      const isOneHanded = Object.keys(WEAPON_DAMAGE).some(
        (key) => lower.includes(key) && WEAPON_DAMAGE[key].category === "melee-one"
      );
      return isOneHanded ? count + item.qty : count;
    }, 0);
  }, [inventory]);

  const detailsJson = useMemo(
    () =>
      JSON.stringify({
        background: background.name,
        backgroundTool: background.tool,
        originFeat: feat.name,
        originFeatDescription: feat.description,
        skills: Array.from(new Set([...background.skills, ...selectedSkills])),
        cantrips: selectedCantrips,
        level1Spells: selectedLevel1,
        classFeatures: classFeatures.map((f) => f.name),
        fightingStyle: charClass === "Krieger" ? fightingStyle : undefined,
        divineOrder: charClass === "Kleriker" ? divineOrder : undefined,
        primalOrder: charClass === "Druide" ? primalOrder : undefined,
        proficiencyBonus: profBonus,
        savingThrowProficiencies: savingProficiencies.map((a) => ABILITY_GERMAN[a]),
        inventory,
        currency: { gold: background.gold, silver: 0, copper: 0 },
      }),
    [
      background,
      feat,
      selectedSkills,
      selectedCantrips,
      selectedLevel1,
      classFeatures,
      charClass,
      fightingStyle,
      divineOrder,
      primalOrder,
      profBonus,
      savingProficiencies,
      inventory,
    ]
  );

  return (
    <form action={createCharacter} className="space-y-6">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="hp_max" value={hp} />
      <input type="hidden" name="armor_class" value={ac} />
      <input type="hidden" name="details_json" value={detailsJson} />
      {(Object.keys(finalScores) as AbilityKeyName[]).map((key) => (
        <input key={key} type="hidden" name={key} value={finalScores[key]} />
      ))}

      {isBeginner && (
        <div className="rounded-md border border-emerald-900 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          Anfänger-Modus: Bei jedem Schritt bekommst du kurze Erklärungen.
          Wähl einfach aus, was dir gefällt – nichts kann hier kaputt gehen.
        </div>
      )}

      {houseRules && (
        <div className="rounded-md border border-tavern-700 bg-tavern-900 px-4 py-3 text-sm text-zinc-300">
          <span className="text-zinc-100 font-medium">Hausregeln: </span>
          {houseRules}
        </div>
      )}

      {/* Grunddaten */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Grunddaten</h2>

        <div>
          <label className="block text-sm text-zinc-300 mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Name deines Charakters"
            className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Rasse / Spezies
            </label>
            <select
              name="race"
              required
              className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {isBeginner && (
              <p className="text-xs text-zinc-500 mt-1">
                Nach den 2024-Regeln bringt die Spezies keine Attributsboni
                mehr mit – das kommt jetzt vom Hintergrund.
              </p>
            )}
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
              className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hintergrund */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Hintergrund</h2>
        {isBeginner && (
          <p className="text-xs text-zinc-500">
            Dein Hintergrund ist, was dein Charakter vor dem Abenteurerleben
            gemacht hat. Er bringt Attributsboni, 2 feste Fertigkeiten, ein
            Werkzeug, Ausrüstung und ein Talent mit.
          </p>
        )}

        <select
          value={backgroundIdx}
          onChange={(e) => selectBackground(Number(e.target.value))}
          className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
        >
          {BACKGROUNDS.map((bg, idx) => (
            <option key={bg.name} value={idx}>
              {bg.name}
            </option>
          ))}
        </select>

        <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3 text-sm space-y-1">
          <p className="text-zinc-300">
            <span className="text-zinc-500">Feste Fertigkeiten: </span>
            {background.skills.join(", ")}
          </p>
          <p className="text-zinc-300">
            <span className="text-zinc-500">Werkzeug: </span>
            {background.tool}
          </p>
          <p className="text-zinc-300">
            <span className="text-zinc-500">Ausrüstung: </span>
            {background.equipment}
          </p>
          <p className="text-zinc-300">
            <span className="text-zinc-500">Ursprungstalent – {feat.name}: </span>
            {feat.description}
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-300 mb-2">
            Attributsboni verteilen (
            {background.abilities.map((a) => ABILITY_GERMAN[a]).join(", ")})
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                checked={asiMode === "twoOne"}
                onChange={() => setAsiMode("twoOne")}
              />
              +2 auf eine, +1 auf eine andere
            </label>
            {asiMode === "twoOne" && (
              <select
                value={plusTwoAbility}
                onChange={(e) =>
                  setPlusTwoAbility(e.target.value as AbilityKeyName)
                }
                className="ml-6 rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 text-sm w-fit"
              >
                {background.abilities.map((a) => (
                  <option key={a} value={a}>
                    +2 auf {ABILITY_GERMAN[a]}
                  </option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                checked={asiMode === "allOne"}
                onChange={() => setAsiMode("allOne")}
              />
              +1 auf alle drei
            </label>
          </div>
        </div>
      </div>

      {/* Attribute */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">Attribute</h2>
        {isBeginner && (
          <p className="text-xs text-zinc-500">
            Verteil diese 6 Werte auf deine Eigenschaften: 15, 14, 13, 12,
            10, 8. Der Hintergrund-Bonus von oben wird automatisch
            addiert. Wählst du einen Wert doppelt, tauscht er einfach mit
            der anderen Eigenschaft.
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
                className="rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500 w-24"
              >
                {STANDARD_ARRAY.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <span className="text-zinc-500 text-sm w-24">
                {bgBonus[key] > 0 && (
                  <span className="text-emerald-400">+{bgBonus[key]} → </span>
                )}
                {finalScores[key]} ({abilityModifier(finalScores[key]) >= 0 ? "+" : ""}
                {abilityModifier(finalScores[key])})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kampfwerte - automatisch berechnet */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">Kampfwerte</h2>
        <p className="text-xs text-zinc-500">
          Automatisch berechnet aus Klasse, Attributen (inkl.
          Hintergrund-Bonus), Ausrüstung und Talent – du musst hier nichts
          eintragen.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
            <span className="text-xs text-zinc-500 block">Lebenspunkte</span>
            <span className="text-xl text-zinc-100 font-medium">{hp}</span>
            <span className="text-xs text-zinc-600 block mt-1">
              Trefferwürfel (W{HIT_DICE[charClass]}) + Konstitution
              {toughBonus > 0 && " + Zäh-Talent"}
            </span>
          </div>
          <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
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

      {/* Rettungswürfe */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">Rettungswürfe</h2>
        <p className="text-xs text-zinc-500">
          Dein Übungsbonus (auf Stufe 1: +{profBonus}) zählt bei{" "}
          {savingProficiencies.map((a) => ABILITY_GERMAN[a]).join(" und ")}{" "}
          automatisch mit dazu.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map(({ key, label }) => {
            const isProficient = savingProficiencies.includes(key);
            const mod = abilityModifier(finalScores[key]) + (isProficient ? profBonus : 0);
            return (
              <div
                key={key}
                className={`rounded-md border px-3 py-2 text-center ${
                  isProficient
                    ? "border-emerald-800 bg-emerald-950/30"
                    : "border-tavern-800 bg-tavern-950"
                }`}
              >
                <span className="text-xs text-zinc-500 block">{label}</span>
                <span className="text-zinc-100 font-medium">
                  {mod >= 0 ? "+" : ""}
                  {mod}
                </span>
                {isProficient && (
                  <span className="text-xs text-emerald-400 block">geübt</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Klassen-Merkmale */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Klassen-Merkmale ({charClass})
        </h2>
        <p className="text-xs text-zinc-500">
          Das bringt deine Klasse automatisch ab Stufe 1 mit.
        </p>
        <div className="space-y-2">
          {classFeatures.map((f) => (
            <div key={f.name} className="rounded-md bg-tavern-950 border border-tavern-800 px-3 py-2">
              <span className="text-zinc-100 text-sm font-medium">{f.name}</span>
              <p className="text-zinc-500 text-xs mt-0.5">{f.description}</p>
            </div>
          ))}
        </div>

        {charClass === "Krieger" && (
          <div>
            <p className="text-sm text-zinc-300 mb-2">Kampfstil wählen</p>
            <div className="grid grid-cols-2 gap-2">
              {FIGHTING_STYLES.map((style) => (
                <label
                  key={style.name}
                  className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                    fightingStyle === style.name
                      ? "border-zinc-300 bg-tavern-800"
                      : "border-tavern-800"
                  }`}
                >
                  <span className="flex items-center gap-2 text-zinc-100 font-medium">
                    <input
                      type="radio"
                      checked={fightingStyle === style.name}
                      onChange={() => setFightingStyle(style.name)}
                    />
                    {style.name}
                  </span>
                  <span className="text-xs text-zinc-500">{style.description}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {charClass === "Kleriker" && (
          <div>
            <p className="text-sm text-zinc-300 mb-2">Göttlicher Orden wählen</p>
            <div className="grid grid-cols-2 gap-2">
              {DIVINE_ORDERS.map((order) => (
                <label
                  key={order.name}
                  className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                    divineOrder === order.name
                      ? "border-zinc-300 bg-tavern-800"
                      : "border-tavern-800"
                  }`}
                >
                  <span className="flex items-center gap-2 text-zinc-100 font-medium">
                    <input
                      type="radio"
                      checked={divineOrder === order.name}
                      onChange={() => setDivineOrder(order.name)}
                    />
                    {order.name}
                  </span>
                  <span className="text-xs text-zinc-500">{order.description}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {charClass === "Druide" && (
          <div>
            <p className="text-sm text-zinc-300 mb-2">Urwüchsiger Orden wählen</p>
            <div className="grid grid-cols-2 gap-2">
              {PRIMAL_ORDERS.map((order) => (
                <label
                  key={order.name}
                  className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                    primalOrder === order.name
                      ? "border-zinc-300 bg-tavern-800"
                      : "border-tavern-800"
                  }`}
                >
                  <span className="flex items-center gap-2 text-zinc-100 font-medium">
                    <input
                      type="radio"
                      checked={primalOrder === order.name}
                      onChange={() => setPrimalOrder(order.name)}
                    />
                    {order.name}
                  </span>
                  <span className="text-xs text-zinc-500">{order.description}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fertigkeiten */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Fertigkeiten der Klasse ({selectedSkills.length}/{skillChoice.count})
        </h2>
        <p className="text-xs text-zinc-500">
          Wähl {skillChoice.count} Fertigkeiten, in denen dein {charClass}{" "}
          laut Regelwerk geübt sein darf. Vom Hintergrund bekommst du
          zusätzlich automatisch{" "}
          <span className="text-zinc-300">{background.skills.join(" und ")}</span>{" "}
          dazu.
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
                    ? "border-zinc-300 bg-tavern-800 text-zinc-100"
                    : "border-tavern-800 text-zinc-300"
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
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Startausrüstung (Klasse)
        </h2>
        <p className="text-xs text-zinc-500">
          Offizielle Ausrüstungspakete für {charClass}. Die Rüstungsklasse
          oben passt sich automatisch an deine Wahl an. Dazu kommt die
          Ausrüstung deines Hintergrunds.
        </p>
        <div className="space-y-2">
          {equipmentOptions.map((opt, idx) => (
            <label
              key={opt.label}
              className={`flex flex-col gap-1 rounded-md border px-4 py-3 cursor-pointer ${
                equipmentIndex === idx
                  ? "border-zinc-300 bg-tavern-800"
                  : "border-tavern-800"
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
              <span className="text-xs text-zinc-600 flex flex-wrap gap-x-3">
                {parseEquipmentString(opt.items)
                  .filter((i) => i.damage)
                  .map((i) => (
                    <span key={i.name}>
                      {i.name}:{" "}
                      {weaponDisplay(
                        i.name,
                        charClass,
                        charClass === "Krieger" ? fightingStyle : null,
                        oneHandedWeaponCount
                      )}
                    </span>
                  ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Inventar-Vorschau */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-3">
        <h2 className="text-lg font-medium text-zinc-100">
          Inventar & Traglast
        </h2>
        <p className="text-xs text-zinc-500">
          Automatisch aus deiner Ausrüstung und deinem Hintergrund
          zusammengestellt, inklusive Gewicht. Nach dem Erstellen kannst du
          im Charakterblatt weitere Gegenstände hinzufügen.
        </p>
        <div className="space-y-1">
          {inventory.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm border-b border-tavern-800 py-1"
            >
              <span className="text-zinc-200">
                {item.qty > 1 ? `${item.qty}× ` : ""}
                {item.name}
                {item.damage && (
                  <span className="text-zinc-500">
                    {" "}
                    (
                    {weaponDisplay(
                      item.name,
                      charClass,
                      charClass === "Krieger" ? fightingStyle : null,
                      oneHandedWeaponCount
                    )}
                    )
                  </span>
                )}
              </span>
              <span className="text-zinc-500">
                {item.qty * item.weight} lb
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-zinc-300">
            Startgold: <span className="text-zinc-100">{background.gold} GS</span>
          </span>
          <span
            className={
              totalWeight > capacity ? "text-red-400" : "text-zinc-300"
            }
          >
            Gewicht: {totalWeight} / {capacity} lb Traglast
          </span>
        </div>
        {totalWeight > capacity && (
          <p className="text-red-400 text-xs">
            Du trägst mehr, als deine Stärke erlaubt – das macht dich
            langsamer. Erhöh Stärke oder wähl leichtere Ausrüstung.
          </p>
        )}
      </div>

      {/* Zauber - nur für Klassen, die ab Stufe 1 zaubern können */}
      {caster ? (
        <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
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
                        ? "border-zinc-300 bg-tavern-800"
                        : "border-tavern-800"
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
                        ? "border-zinc-300 bg-tavern-800"
                        : "border-tavern-800"
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
        <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-1">Zauber</h2>
          <p className="text-xs text-zinc-500">
            {charClass} beherrscht auf Stufe 1 noch keine Zauber.
          </p>
        </div>
      )}

      {/* Hintergrund-Geschichte */}
      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">
          Profilbild für die Karte
        </h2>
        <p className="text-xs text-zinc-500">
          Dieses Bild erscheint als dein Pin auf der Live-Karte, sobald der
          Meister eine Sitzung startet. Optional - ohne Bild bekommst du
          einfach einen farbigen Kreis mit deinen Initialen.
        </p>
        <input
          type="file"
          name="token_image"
          accept="image/*"
          className="text-sm text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-tavern-800 file:text-zinc-200 file:px-3 file:py-1.5"
        />
      </div>

      <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-100">
          Hintergrundgeschichte
        </h2>
        <textarea
          name="background_story"
          rows={3}
          placeholder="Wer ist dein Charakter, woher kommt er... (optional)"
          className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={selectedSkills.length !== skillChoice.count}
        className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium py-2.5 hover:bg-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
