"use client";

// Schwebendes Werkzeug-Menü für den Meister. Ein Tap öffnet die
// Werkzeugliste, ein weiterer Tap öffnet GENAU dieses eine Werkzeug als
// Pop-up über der Karte - nichts anderes drängt sich gleichzeitig rein.

import { useState } from "react";

type Tool = "notes" | "npc" | "players" | "initiative" | "dice" | "map";

const TOOLS: { key: Tool; label: string; icon: string }[] = [
  { key: "map", label: "Karte wechseln", icon: "🗺️" },
  { key: "npc", label: "NPC erstellen", icon: "👹" },
  { key: "notes", label: "Meine Notizen", icon: "📝" },
  { key: "players", label: "Spieler", icon: "👥" },
  { key: "initiative", label: "Initiative", icon: "⚔️" },
  { key: "dice", label: "Würfeln", icon: "🎲" },
];

export default function MasterToolMenu({
  mapContent,
  npcContent,
  notesContent,
  playersContent,
  initiativeContent,
  diceContent,
}: {
  mapContent: React.ReactNode;
  npcContent: React.ReactNode;
  notesContent: React.ReactNode;
  playersContent: React.ReactNode;
  initiativeContent: React.ReactNode;
  diceContent: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openTool, setOpenTool] = useState<Tool | null>(null);

  const content: Record<Tool, React.ReactNode> = {
    map: mapContent,
    npc: npcContent,
    notes: notesContent,
    players: playersContent,
    initiative: initiativeContent,
    dice: diceContent,
  };

  const activeTool = TOOLS.find((t) => t.key === openTool);

  return (
    <>
      {/* Menü-Liste */}
      {menuOpen && (
        <div className="fixed bottom-20 right-4 z-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setOpenTool(t.key);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800 transition text-left whitespace-nowrap"
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Schwebender Knopf */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-zinc-100 text-zinc-900 shadow-xl flex items-center justify-center text-2xl hover:bg-white transition"
        aria-label="Werkzeuge"
      >
        {menuOpen ? "×" : "⋮"}
      </button>

      {/* Backdrop zum Schließen des Menüs bei Klick daneben */}
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}

      {/* Werkzeug-Pop-up: genau EIN Fenster */}
      {activeTool && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenTool(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-zinc-100 font-medium">
                {activeTool.icon} {activeTool.label}
              </h3>
              <button
                onClick={() => setOpenTool(null)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                Schließen
              </button>
            </div>
            {content[activeTool.key]}
          </div>
        </div>
      )}
    </>
  );
}
