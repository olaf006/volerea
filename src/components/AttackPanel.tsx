"use client";

// Angriffs-Panel: Ziel auswählen, Waffe auswählen, würfeln - der Schaden
// wird automatisch beim Ziel abgezogen. Zeigt nur Ziele, die aktuell auf
// der Karte platziert sind (Gegner-Pins, also ohne Besitzer).

import { useEffect, useState } from "react";
import { createAuthedRealtimeClient } from "@/lib/supabase/client";
import { resolveAttack } from "@/app/combat-actions";

interface EnemyToken {
  id: string;
  label: string;
  hp_current: number | null;
  hp_max: number | null;
}

interface Weapon {
  name: string;
  damage: string; // z.B. "1W6 Stich"
}

export default function AttackPanel({
  campaignId,
  activeMapId,
  weapons,
}: {
  campaignId: string;
  activeMapId: string | null;
  weapons: Weapon[];
}) {
  const [enemies, setEnemies] = useState<EnemyToken[]>([]);
  const [targetId, setTargetId] = useState("");
  const [weaponIdx, setWeaponIdx] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    if (!activeMapId) {
      setEnemies([]);
      return;
    }
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      const { data } = await supabase
        .from("map_tokens")
        .select("id, label, owner_user_id, placed, hp_current, hp_max")
        .eq("map_id", activeMapId)
        .eq("placed", true)
        .is("owner_user_id", null);
      if (active) {
        setEnemies(data ?? []);
        if (data && data.length > 0) setTargetId((prev) => prev || data[0].id);
      }

      const channel = supabase
        .channel(`attack_enemies:${activeMapId}`)
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
              setEnemies((prev) =>
                prev.filter((e) => e.id !== (payload.old as { id: string }).id)
              );
              return;
            }
            const row = payload.new as {
              id: string;
              label: string;
              owner_user_id: string | null;
              placed: boolean;
              hp_current: number | null;
              hp_max: number | null;
            };
            if (row.owner_user_id !== null || !row.placed) {
              setEnemies((prev) => prev.filter((e) => e.id !== row.id));
              return;
            }
            setEnemies((prev) => {
              const exists = prev.some((e) => e.id === row.id);
              if (exists) return prev.map((e) => (e.id === row.id ? row : e));
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

  const weapon = weapons[weaponIdx];
  const target = enemies.find((e) => e.id === targetId);

  async function attack() {
    if (!target || !weapon) return;
    setRolling(true);
    const formData = new FormData();
    formData.set("campaign_id", campaignId);
    formData.set("target_token_id", target.id);
    formData.set("target_label", target.label);
    formData.set("dice_notation", weapon.damage);
    formData.set("weapon_label", weapon.name);
    await resolveAttack(formData);
    setLastResult(`${weapon.name} auf ${target.label} getroffen!`);
    setRolling(false);
    setTimeout(() => setLastResult(null), 2500);
  }

  if (weapons.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Keine Waffe im Inventar mit Schadenswürfel gefunden.
      </p>
    );
  }

  if (enemies.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Keine Gegner-Pins auf der Karte platziert.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
        className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
      >
        {enemies.map((e) => (
          <option key={e.id} value={e.id}>
            {e.label}
            {e.hp_max !== null ? ` (${e.hp_current}/${e.hp_max} HP)` : ""}
          </option>
        ))}
      </select>

      <select
        value={weaponIdx}
        onChange={(e) => setWeaponIdx(Number(e.target.value))}
        className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-2 py-1.5 text-zinc-100 text-sm"
      >
        {weapons.map((w, idx) => (
          <option key={w.name + idx} value={idx}>
            {w.name} ({w.damage})
          </option>
        ))}
      </select>

      <button
        onClick={attack}
        disabled={rolling}
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
