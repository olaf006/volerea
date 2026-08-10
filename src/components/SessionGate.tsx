"use client";

// Wartebildschirm für Spieler, bevor der Meister die Sitzung startet.
// Schaltet automatisch um, sobald session_active auf true wechselt -
// kein Neuladen der Seite nötig.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SessionGate({
  campaignId,
  initialActive,
  campaignName,
  children,
}: {
  campaignId: string;
  initialActive: boolean;
  campaignName: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(initialActive);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`session_gate:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_state",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const row = payload.new as { session_active: boolean };
          setActive(Boolean(row?.session_active));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  if (!active) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            {campaignName}
          </h1>
          <p className="text-zinc-400 text-sm">
            Warte, bis der Meister die Sitzung startet…
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
