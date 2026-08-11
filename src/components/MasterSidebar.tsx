"use client";

// Feste Werkzeugleiste für den Meister statt schwebender Pop-up-Fenster.
// Ein Klick auf einen Reiter wechselt den Inhalt direkt im selben Fach -
// die Karte bleibt daneben immer sichtbar, kein Fenster verdeckt sie.

import { useState } from "react";

type Tool = "map" | "npc" | "attack" | "notes" | "players" | "initiative" | "dice";

const TOOLS: { key: Tool; label: string; icon: string }[] = [
  { key: "map", label: "Karte", icon: "🗺️" },
  { key: "npc", label: "NPC", icon: "👹" },
  { key: "attack", label: "Angriff", icon: "⚔️" },
  { key: "players", label: "Spieler", icon: "👥" },
  { key: "initiative", label: "Kampf", icon: "🎯" },
  { key: "dice", label: "Würfel", icon: "🎲" },
  { key: "notes", label: "Notizen", icon: "📝" },
];

export default function MasterSidebar({
  mapContent,
  npcContent,
  attackContent,
  notesContent,
  playersContent,
  initiativeContent,
  diceContent,
}: {
  mapContent: React.ReactNode;
  npcContent: React.ReactNode;
  attackContent: React.ReactNode;
  notesContent: React.ReactNode;
  playersContent: React.ReactNode;
  initiativeContent: React.ReactNode;
  diceContent: React.ReactNode;
}) {
  const [active, setActive] = useState<Tool>("players");

  const content: Record<Tool, React.ReactNode> = {
    map: mapContent,
    npc: npcContent,
    attack: attackContent,
    notes: notesContent,
    players: playersContent,
    initiative: initiativeContent,
    dice: diceContent,
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-amber-900/40 bg-zinc-900/80 overflow-hidden">
      {/* Reiter */}
      <div className="grid grid-cols-4 sm:grid-cols-7 border-b border-amber-900/40 flex-shrink-0">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition ${
              active === t.key
                ? "bg-amber-900/30 text-amber-300 border-b-2 border-amber-500"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Inhalt des aktiven Reiters */}
      <div className="flex-1 overflow-y-auto p-3">{content[active]}</div>
    </div>
  );
}
