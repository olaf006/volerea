"use client";

// Beobachtet den eigenen Charakter: sobald XP für die nächste Stufe
// reichen, öffnet sich automatisch das Auswahl-Fenster - ganz ohne
// Klick. Reicht die XP für mehrere Stufen auf einmal, geht's nach dem
// Bestätigen direkt mit der nächsten weiter.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient, createClient } from "@/lib/supabase/client";
import LevelUpForm from "@/components/LevelUpForm";
import { levelForXp, CharClass, AbilityKeyName } from "@/lib/dnd-data";

interface CharacterState {
  id: string;
  class: string;
  level: number;
  xp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  details: { cantrips?: string[]; level1Spells?: string[] } | null;
}

export default function LevelUpWatcher({
  campaignId,
  characterId,
}: {
  campaignId: string;
  characterId: string;
}) {
  const [character, setCharacter] = useState<CharacterState | null>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("characters")
        .select(
          "id, class, level, xp, strength, dexterity, constitution, intelligence, wisdom, charisma, details"
        )
        .eq("id", characterId)
        .single();
      if (active && data) setCharacter(data);

      const realtimeSupabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = realtimeSupabase
        .channel(`levelup_watch:${characterId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "characters",
            filter: `id=eq.${characterId}`,
          },
          (payload) => {
            setCharacter(payload.new as CharacterState);
          }
        )
        .subscribe();

      cleanup = () => realtimeSupabase.removeChannel(channel);
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [characterId]);

  if (!character) return null;

  const pendingLevel = levelForXp(character.xp);
  const eligible = pendingLevel > character.level;

  if (!eligible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4">
      <div className="bg-zinc-900 border border-emerald-700 rounded-lg p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
        <LevelUpForm
          campaignId={campaignId}
          characterId={character.id}
          charClass={character.class as CharClass}
          currentLevel={character.level}
          currentAbilities={{
            strength: character.strength,
            dexterity: character.dexterity,
            constitution: character.constitution,
            intelligence: character.intelligence,
            wisdom: character.wisdom,
            charisma: character.charisma,
          } as Record<AbilityKeyName, number>}
          currentDetails={{
            cantrips: character.details?.cantrips,
            level1Spells: character.details?.level1Spells,
          }}
        />
      </div>
    </div>
  );
}
