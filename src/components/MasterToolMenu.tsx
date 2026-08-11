"use client";

// Schwebendes Werkzeug-Menü für den Meister. Jedes geöffnete Werkzeug ist
// ein eigenes, frei verschiebbares Fenster (kein Vollbild-Hintergrund) -
// die Karte bleibt dahinter voll bedienbar, mehrere Fenster können
// gleichzeitig offen sein.

import { useRef, useState } from "react";

type Tool = "notes" | "npc" | "players" | "initiative" | "dice" | "map";

const TOOLS: { key: Tool; label: string; icon: string }[] = [
  { key: "map", label: "Karte wechseln", icon: "🗺️" },
  { key: "npc", label: "NPC erstellen", icon: "👹" },
  { key: "notes", label: "Meine Notizen", icon: "📝" },
  { key: "players", label: "Spieler", icon: "👥" },
  { key: "initiative", label: "Initiative", icon: "⚔️" },
  { key: "dice", label: "Würfeln", icon: "🎲" },
];

interface OpenWindow {
  key: Tool;
  x: number;
  y: number;
  z: number;
}

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
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const zCounter = useRef(50);
  const dragRef = useRef<{ key: Tool; offsetX: number; offsetY: number } | null>(null);

  const content: Record<Tool, React.ReactNode> = {
    map: mapContent,
    npc: npcContent,
    notes: notesContent,
    players: playersContent,
    initiative: initiativeContent,
    dice: diceContent,
  };

  function openTool(key: Tool) {
    setMenuOpen(false);
    setWindows((prev) => {
      const existing = prev.find((w) => w.key === key);
      zCounter.current += 1;
      if (existing) {
        return prev.map((w) => (w.key === key ? { ...w, z: zCounter.current } : w));
      }
      // Neue Fenster leicht versetzt zueinander platzieren
      const offset = prev.length * 24;
      return [
        ...prev,
        {
          key,
          x: 24 + offset,
          y: 24 + offset,
          z: zCounter.current,
        },
      ];
    });
  }

  function closeTool(key: Tool) {
    setWindows((prev) => prev.filter((w) => w.key !== key));
  }

  function focusTool(key: Tool) {
    zCounter.current += 1;
    setWindows((prev) => prev.map((w) => (w.key === key ? { ...w, z: zCounter.current } : w)));
  }

  function startTitleDrag(e: React.PointerEvent, win: OpenWindow) {
    e.preventDefault();
    dragRef.current = { key: win.key, offsetX: e.clientX - win.x, offsetY: e.clientY - win.y };
    focusTool(win.key);

    function move(ev: PointerEvent) {
      if (!dragRef.current) return;
      const { key, offsetX, offsetY } = dragRef.current;
      setWindows((prev) =>
        prev.map((w) =>
          w.key === key
            ? {
                ...w,
                x: Math.max(0, ev.clientX - offsetX),
                y: Math.max(0, ev.clientY - offsetY),
              }
            : w
        )
      );
    }
    function up() {
      dragRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <>
      {windows.map((win) => {
        const tool = TOOLS.find((t) => t.key === win.key)!;
        return (
          <div
            key={win.key}
            className="fixed bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-[90vw] max-w-sm flex flex-col"
            style={{ left: win.x, top: win.y, zIndex: win.z, maxHeight: "70vh" }}
            onPointerDown={() => focusTool(win.key)}
          >
            <div
              onPointerDown={(e) => startTitleDrag(e, win)}
              className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 cursor-move select-none touch-none flex-shrink-0"
            >
              <span className="text-zinc-100 text-sm font-medium">
                {tool.icon} {tool.label}
              </span>
              <button
                onClick={() => closeTool(win.key)}
                className="text-zinc-500 hover:text-zinc-300 text-sm px-1"
              >
                ×
              </button>
            </div>
            <div className="p-3 overflow-y-auto">{content[win.key]}</div>
          </div>
        );
      })}

      {menuOpen && (
        <div className="fixed bottom-20 right-4 z-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => openTool(t.key)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-800 transition text-left whitespace-nowrap"
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-zinc-100 text-zinc-900 shadow-xl flex items-center justify-center text-2xl hover:bg-white transition"
        aria-label="Werkzeuge"
      >
        {menuOpen ? "×" : "⋮"}
      </button>

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
