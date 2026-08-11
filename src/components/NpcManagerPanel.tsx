"use client";

// NPC-Verwaltung: eigenständig (holt sich seine Daten selbst), damit sie
// problemlos in einem Pop-up laufen kann. Neue NPCs erscheinen sofort
// mittig auf der Karte - danach einfach dorthin ziehen, wo sie hin sollen.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";
import { deleteToken } from "@/app/tokens-actions";
import NpcCreationForm from "@/components/NpcCreationForm";

interface Token {
  id: string;
  label: string;
  owner_user_id: string | null;
}

export default function NpcManagerPanel({
  campaignId,
  activeMapId,
}: {
  campaignId: string;
  activeMapId: string | null;
}) {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (!activeMapId) {
      setTokens([]);
      return;
    }
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      const { data } = await supabase
        .from("map_tokens")
        .select("id, label, owner_user_id")
        .eq("map_id", activeMapId)
        .is("owner_user_id", null);
      if (active) setTokens(data ?? []);

      const channel = supabase
        .channel(`npc_manager:${activeMapId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "map_tokens",
            filter: `map_id=eq.${activeMapId}`,
          },
          (payload: any) => {
            if (!active) return;
            if (payload.eventType === "DELETE") {
              setTokens((prev) =>
                prev.filter((t) => t.id !== (payload.old as { id: string }).id)
              );
              return;
            }
            const row = payload.new as Token;
            if (row.owner_user_id !== null) return;
            setTokens((prev) => {
              const exists = prev.some((t) => t.id === row.id);
              if (exists) return prev.map((t) => (t.id === row.id ? row : t));
              return [...prev, row];
            });
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [activeMapId]);

  if (!activeMapId) {
    return (
      <p className="text-sm text-zinc-500">
        Erst eine Karte live schalten, dann können NPCs angelegt werden.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <NpcCreationForm campaignId={campaignId} mapId={activeMapId} alwaysOpen />

      {tokens.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Vorhandene NPCs:</p>
          <div className="space-y-1">
            {tokens.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-1.5 text-sm"
              >
                <span className="text-zinc-200">{t.label}</span>
                <form action={deleteToken}>
                  <input type="hidden" name="campaign_id" value={campaignId} />
                  <input type="hidden" name="token_id" value={t.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Löschen
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
