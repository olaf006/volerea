"use client";

// Live-Würfel-Feed: zeigt die letzten Würfe der ganzen Gruppe, aktualisiert
// sich automatisch über Supabase Realtime.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";

interface Roll {
  id: string;
  user_id: string;
  dice: string;
  result: number;
  created_at: string;
}

export default function LiveDiceFeed({
  campaignId,
  initialRolls,
  labels,
}: {
  campaignId: string;
  initialRolls: Roll[];
  labels: Record<string, string>;
}) {
  const [rolls, setRolls] = useState<Roll[]>(initialRolls);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = supabase
        .channel(`dice_rolls:${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "dice_rolls",
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload) => {
            const newRoll = payload.new as Roll;
            setRolls((prev) => [newRoll, ...prev].slice(0, 15));
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

  return (
    <div className="space-y-1">
      {rolls.length === 0 && (
        <p className="text-zinc-500 text-sm">Noch niemand hat gewürfelt.</p>
      )}
      {rolls.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between text-sm rounded-md bg-zinc-950 border border-zinc-800 px-3 py-1.5"
        >
          <span className="text-zinc-300">
            {labels[r.user_id] ?? "Jemand"} würfelt {r.dice}
          </span>
          <span className="text-zinc-100 font-medium">{r.result}</span>
        </div>
      ))}
    </div>
  );
}
