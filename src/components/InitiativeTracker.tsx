"use client";

// Initiative-Tracker: zeigt die Kampfreihenfolge, hebt hervor wer dran
// ist, aktualisiert sich live bei allen. Der Meister steuert (Kampf
// starten/weiter/beenden), Spieler sehen nur zu.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";
import { startCombat, nextTurn, endCombat } from "@/app/combat-actions";

interface TurnEntry {
  tokenId: string;
  label: string;
  isPlayer: boolean;
  initiative: number;
}

interface CombatState {
  turn_order: TurnEntry[];
  current_index: number;
  active: boolean;
}

export default function InitiativeTracker({
  campaignId,
  activeMapId,
  isMaster,
  initialState,
}: {
  campaignId: string;
  activeMapId: string | null;
  isMaster: boolean;
  initialState: CombatState | null;
}) {
  const [state, setState] = useState<CombatState | null>(initialState);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = supabase
        .channel(`combat_state:${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "combat_state",
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload: any) => {
            setState(payload.new as CombatState);
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [campaignId]);

  if (!state?.active) {
    if (!isMaster) {
      return <p className="text-zinc-500 text-xs">Kein Kampf im Gange.</p>;
    }
    return (
      <form action={startCombat}>
        <input type="hidden" name="campaign_id" value={campaignId} />
        <input type="hidden" name="map_id" value={activeMapId ?? ""} />
        <button
          type="submit"
          disabled={!activeMapId}
          className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium px-3 py-2 text-sm hover:bg-amber-400 transition disabled:opacity-40"
        >
          Kampf starten (Initiative würfeln)
        </button>
        {!activeMapId && (
          <p className="text-xs text-zinc-500 mt-1">
            Erst eine Karte live schalten.
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        {state.turn_order.map((entry, idx) => (
          <div
            key={entry.tokenId}
            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
              idx === state.current_index
                ? "bg-emerald-950/40 border border-emerald-800 text-emerald-200"
                : "text-zinc-300"
            }`}
          >
            <span>{entry.label}</span>
            <span className="text-xs text-zinc-500">{entry.initiative}</span>
          </div>
        ))}
      </div>

      {isMaster && (
        <div className="flex gap-2">
          <form action={nextTurn} className="flex-1">
            <input type="hidden" name="campaign_id" value={campaignId} />
            <button
              type="submit"
              className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium px-3 py-1.5 text-sm hover:bg-amber-400 transition"
            >
              Nächster
            </button>
          </form>
          <form action={endCombat}>
            <input type="hidden" name="campaign_id" value={campaignId} />
            <button
              type="submit"
              className="rounded-md border border-tavern-700 text-zinc-300 px-3 py-1.5 text-sm hover:bg-tavern-800 transition"
            >
              Beenden
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
