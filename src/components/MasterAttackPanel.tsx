"use client";

// Meister-Angriff: NPC (mit Waffe) als Angreifer wählen, Spieler als Ziel
// wählen, würfeln - Schaden geht automatisch vom Charakter-HP des Ziels ab.

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";
import { resolveMasterAttack } from "@/app/combat-actions";

interface NpcToken {
  id: string;
  label: string;
  details: { weapon?: { name: string; damage: string } | null } | null;
}

interface PlayerToken {
  id: string;
  label: string;
  owner_user_id: string;
}

export default function MasterAttackPanel({
  campaignId,
  activeMapId,
  characterLookup,
}: {
  campaignId: string;
  activeMapId: string | null;
  characterLookup: Record<string, { id: string; name: string }>; // user_id -> character
}) {
  const [npcs, setNpcs] = useState<NpcToken[]>([]);
  const [players, setPlayers] = useState<PlayerToken[]>([]);
  const [attackerId, setAttackerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    if (!activeMapId) {
      setNpcs([]);
      setPlayers([]);
      return;
    }
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      const { data } = await supabase
        .from("map_tokens")
        .select("id, label, owner_user_id, placed, details")
        .eq("map_id", activeMapId)
        .eq("placed", true);
      if (!active) return;

      const npcList = (data ?? []).filter((t: any) => t.owner_user_id === null);
      const playerList = (data ?? []).filter((t: any) => t.owner_user_id !== null);
      setNpcs(npcList);
      setPlayers(playerList as PlayerToken[]);
      if (npcList.length > 0) setAttackerId((prev) => prev || npcList[0].id);
      if (playerList.length > 0) setTargetId((prev) => prev || playerList[0].id);

      const channel = supabase
        .channel(`master_attack:${activeMapId}`)
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
              const oldId = (payload.old as { id: string }).id;
              setNpcs((prev) => prev.filter((t) => t.id !== oldId));
              setPlayers((prev) => prev.filter((t) => t.id !== oldId));
              return;
            }
            const row = payload.new as NpcToken & PlayerToken & { placed: boolean };
            const isNpc = row.owner_user_id === null;
            if (!row.placed) {
              setNpcs((prev) => prev.filter((t) => t.id !== row.id));
              setPlayers((prev) => prev.filter((t) => t.id !== row.id));
              return;
            }
            if (isNpc) {
              setNpcs((prev) => {
                const exists = prev.some((t) => t.id === row.id);
                return exists ? prev.map((t) => (t.id === row.id ? row : t)) : [...prev, row];
              });
            } else {
              setPlayers((prev) => {
                const exists = prev.some((t) => t.id === row.id);
                return exists ? prev.map((t) => (t.id === row.id ? row : t)) : [...prev, row];
              });
            }
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

  const attacker = npcs.find((n) => n.id === attackerId);
  const target = players.find((p) => p.id === targetId);
  const targetCharacter = target ? characterLookup[target.owner_user_id] : null;

  async function attack() {
    if (!attacker?.details?.weapon || !target || !targetCharacter) return;
    setRolling(true);
    const formData = new FormData();
    formData.set("campaign_id", campaignId);
    formData.set("attacker_label", attacker.label);
    formData.set("dice_notation", attacker.details.weapon.damage);
    formData.set("target_character_id", targetCharacter.id);
    formData.set("target_label", targetCharacter.name);
    await resolveMasterAttack(formData);
    setLastResult(`${attacker.label} trifft ${targetCharacter.name}!`);
    setRolling(false);
    setTimeout(() => setLastResult(null), 2500);
  }

  if (npcs.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Kein NPC mit Waffe auf der Karte platziert.
      </p>
    );
  }
  if (players.length === 0) {
    return <p className="text-xs text-zinc-500">Kein Spieler-Pin auf der Karte.</p>;
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Angreifer (NPC)</label>
        <select
          value={attackerId}
          onChange={(e) => setAttackerId(e.target.value)}
          className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
        >
          {npcs.map((n) => (
            <option key={n.id} value={n.id}>
              {n.label}
              {n.details?.weapon ? ` (${n.details.weapon.name})` : " (keine Waffe)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Ziel (Spieler)</label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={attack}
        disabled={rolling || !attacker?.details?.weapon}
        className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium px-3 py-2 text-sm hover:bg-amber-400 transition disabled:opacity-50"
      >
        {rolling ? "…" : "Angriff würfeln!"}
      </button>

      {lastResult && (
        <p className="text-xs text-emerald-400 text-center">{lastResult}</p>
      )}
    </div>
  );
}
