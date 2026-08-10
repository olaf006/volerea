"use client";

// Wartebildschirm für Spieler, bevor der Meister die Sitzung startet.
// Schaltet automatisch um, sobald session_active auf true wechselt - mit
// einem Intro-Video als Übergang, kein Neuladen der Seite nötig.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import IntroVideo from "@/components/IntroVideo";

type Phase = "lobby" | "intro" | "live";

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
  // War die Sitzung beim Laden der Seite schon aktiv (z.B. Neuladen mitten
  // in der Sitzung), zeigen wir kein Intro - das gibt's nur beim echten
  // Start-Moment.
  const [phase, setPhase] = useState<Phase>(initialActive ? "live" : "lobby");

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
          setPhase((current) => {
            if (row?.session_active && current === "lobby") return "intro";
            if (!row?.session_active) return "lobby";
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  if (phase === "lobby") {
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

  if (phase === "intro") {
    return <IntroVideo onFinished={() => setPhase("live")} />;
  }

  return <>{children}</>;
}
