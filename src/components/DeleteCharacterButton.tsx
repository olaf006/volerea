"use client";

// Löschen-Button mit Sicherheitsabfrage, damit niemand aus Versehen
// seinen Charakter verliert.

import { deleteCharacter } from "@/app/characters-actions";

export default function DeleteCharacterButton({
  characterId,
  campaignId,
  characterName,
}: {
  characterId: string;
  campaignId: string;
  characterName: string;
}) {
  return (
    <form
      action={deleteCharacter}
      onSubmit={(e) => {
        if (
          !confirm(
            `${characterName} wirklich unwiderruflich löschen?`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="character_id" value={characterId} />
      <input type="hidden" name="campaign_id" value={campaignId} />
      <button
        type="submit"
        className="text-red-400 hover:text-red-300 text-xs"
      >
        Löschen
      </button>
    </form>
  );
}
