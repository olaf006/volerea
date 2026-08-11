"use client";

// Verfolgt, wer GERADE aktiv auf dem Live-Bildschirm ist (Supabase
// "Presence"-Funktion). Damit tauchen nur wirklich online befindliche
// Spieler in der Liste und als Pin auf der Karte auf - nicht jeder, der
// irgendwann mal einen Charakter erstellt hat.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";

export function useOnlineUsers(campaignId: string, myUserId: string) {
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    let channel: any = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const presenceChannel = supabase.channel(`presence:${campaignId}`, {
        config: { presence: { key: myUserId }, private: true },
      });

      presenceChannel.on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setOnline(new Set(Object.keys(state)));
      });

      presenceChannel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

      channel = presenceChannel;
    })();

    return () => {
      active = false;
      channel?.unsubscribe();
    };
  }, [campaignId, myUserId]);

  return online;
}
