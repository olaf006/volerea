"use client";

// Große Ankündigung für ALLE in der Sitzung, sobald irgendein Charakter
// genug XP für die nächste Stufe erreicht hat.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";

interface Event {
  id: string;
  character_name: string;
  new_level: number;
}

export default function LevelUpBanner({ campaignId }: { campaignId: string }) {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = supabase
        .channel(`level_up_banner:${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "level_up_events",
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload: any) => {
            setEvent(payload.new as Event);
            setTimeout(() => setEvent(null), 5000);
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

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="bg-tavern-900 border-2 border-emerald-500 rounded-xl px-8 py-6 shadow-2xl text-center animate-pulse">
        <p className="text-4xl mb-2">🎉</p>
        <p className="text-2xl font-bold text-zinc-100">
          {event.character_name}
        </p>
        <p className="text-lg text-emerald-400">
          hat Stufe {event.new_level} erreicht!
        </p>
      </div>
    </div>
  );
}
