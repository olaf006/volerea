"use client";

// Zeigt die aktuell "live geschaltete" Karte an und aktualisiert sich
// automatisch bei allen Spielern, sobald der Meister eine andere Karte
// wählt - über Supabase Realtime (kein Neuladen der Seite nötig).

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";

interface MapInfo {
  id: string;
  name: string;
  image_url: string;
}

export default function LiveMapDisplay({
  campaignId,
  maps,
  initialActiveMapId,
}: {
  campaignId: string;
  maps: MapInfo[];
  initialActiveMapId: string | null;
}) {
  const [activeMapId, setActiveMapId] = useState(initialActiveMapId);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = supabase
        .channel(`campaign_state:${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "campaign_state",
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload: any) => {
            const newRow = payload.new as { active_map_id: string | null };
            setActiveMapId(newRow?.active_map_id ?? null);
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

  const activeMap = maps.find((m) => m.id === activeMapId);

  if (!activeMap) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center">
        <p className="text-zinc-500 text-sm">
          Der Meister hat noch keine Karte live geschaltet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activeMap.image_url}
        alt={activeMap.name}
        className="w-full h-auto"
      />
      <div className="px-4 py-2 text-sm text-zinc-400 border-t border-zinc-800">
        {activeMap.name}
      </div>
    </div>
  );
}
