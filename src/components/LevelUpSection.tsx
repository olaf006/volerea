"use client";

import { useState } from "react";
import LevelUpForm from "@/components/LevelUpForm";
import { CharClass, AbilityKeyName } from "@/lib/dnd-data";

export default function LevelUpSection({
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
  currentDetails: { cantrips?: string[]; level1Spells?: string[] };
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-tavern-700 bg-tavern-900 text-zinc-100 font-medium py-3 hover:bg-tavern-800 transition mb-6"
      >
        🎉 Stufenaufstieg (Stufe {currentLevel + 1})
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-6 mb-6">
      <LevelUpForm
        campaignId={campaignId}
        characterId={characterId}
        charClass={charClass}
        currentLevel={currentLevel}
        currentAbilities={currentAbilities}
        currentDetails={currentDetails}
      />
      <button
        onClick={() => setOpen(false)}
        className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 mt-3"
      >
        Abbrechen
      </button>
    </div>
  );
}
