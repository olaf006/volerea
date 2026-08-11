"use client";

// Live-Karte mit Pins (wie Google-Maps-Marker): der Meister kann Pins für
// Monster/NSCs anlegen und frei verschieben. Jeder Spieler hat automatisch
// einen eigenen Pin (benannt nach seinem Charakter) und darf NUR den
// verschieben. Alle Positionsänderungen sind sofort bei allen sichtbar.

import { useEffect, useRef, useState } from "react";
import { createClient, createAuthedRealtimeClient } from "@/lib/supabase/client";
import { createToken, deleteToken } from "@/app/tokens-actions";

interface MapInfo {
  id: string;
  name: string;
  image_url: string;
}

interface Token {
  id: string;
  map_id: string;
  owner_user_id: string | null;
  label: string;
  image_url: string | null;
  pos_x: number;
  pos_y: number;
  placed: boolean;
}

function colorForToken(id: string) {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#818cf8", "#e879f9"];
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % colors.length;
  return colors[hash];
}

export default function LiveMapWithTokens({
  campaignId,
  maps,
  initialActiveMapId,
  isMaster,
  myUserId,
  myCharacterLabel,
}: {
  campaignId: string;
  maps: MapInfo[];
  initialActiveMapId: string | null;
  isMaster: boolean;
  myUserId: string;
  myCharacterLabel?: string;
}) {
  const [activeMapId, setActiveMapId] = useState(initialActiveMapId);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const createdOwnTokenFor = useRef<string | null>(null);

  const activeMap = maps.find((m) => m.id === activeMapId);

  // Aktive Karte live verfolgen (wie LiveMapDisplay)
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = supabase
        .channel(`campaign_state_tokens:${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "campaign_state",
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload) => {
            const row = payload.new as { active_map_id: string | null };
            setActiveMapId(row?.active_map_id ?? null);
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

  // Pins für die aktuell aktive Karte laden + live verfolgen
  useEffect(() => {
    if (!activeMapId) {
      setTokens([]);
      return;
    }
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("map_tokens")
        .select("id, map_id, owner_user_id, label, image_url, pos_x, pos_y, placed")
        .eq("map_id", activeMapId);
      if (active) setTokens(data ?? []);

      const realtimeSupabase = await createAuthedRealtimeClient();
      if (!active) return;

      const channel = realtimeSupabase
        .channel(`map_tokens:${activeMapId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "map_tokens",
            filter: `map_id=eq.${activeMapId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setTokens((prev) => [...prev, payload.new as Token]);
            } else if (payload.eventType === "UPDATE") {
              setTokens((prev) =>
                prev.map((t) =>
                  t.id === (payload.new as Token).id ? (payload.new as Token) : t
                )
              );
            } else if (payload.eventType === "DELETE") {
              setTokens((prev) =>
                prev.filter((t) => t.id !== (payload.old as Token).id)
              );
            }
          }
        )
        .subscribe();

      cleanup = () => realtimeSupabase.removeChannel(channel);
    })();

    return () => {
      active = false;
      cleanup?.();
    };
  }, [activeMapId]);

  // Eigenen Spieler-Pin automatisch anlegen, falls noch keiner existiert
  useEffect(() => {
    if (isMaster || !activeMapId || !myCharacterLabel) return;
    if (createdOwnTokenFor.current === activeMapId) return;
    const alreadyExists = tokens.some((t) => t.owner_user_id === myUserId);
    if (alreadyExists) {
      createdOwnTokenFor.current = activeMapId;
      return;
    }
    createdOwnTokenFor.current = activeMapId;
    const supabase = createClient();
    supabase.from("map_tokens").insert({
      campaign_id: campaignId,
      map_id: activeMapId,
      owner_user_id: myUserId,
      label: myCharacterLabel,
      pos_x: 50,
      pos_y: 50,
      placed: true,
    });
  }, [activeMapId, tokens, isMaster, myUserId, myCharacterLabel, campaignId]);

  function canDrag(token: Token) {
    return isMaster || token.owner_user_id === myUserId;
  }

  const placedTokens = tokens.filter((t) => t.placed);
  const unplacedTokens = tokens.filter((t) => !t.placed);

  function handleDragStartFromList(e: React.DragEvent, tokenId: string) {
    e.dataTransfer.setData("text/plain", tokenId);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const tokenId = e.dataTransfer.getData("text/plain");
    if (!tokenId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    setTokens((prev) =>
      prev.map((t) =>
        t.id === tokenId ? { ...t, placed: true, pos_x: x, pos_y: y } : t
      )
    );

    const supabase = createClient();
    supabase
      .from("map_tokens")
      .update({ placed: true, pos_x: x, pos_y: y })
      .eq("id", tokenId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragTokenId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setTokens((prev) =>
      prev.map((t) => (t.id === dragTokenId ? { ...t, pos_x: x, pos_y: y } : t))
    );
  }

  function handlePointerUp() {
    if (!dragTokenId) return;
    const token = tokens.find((t) => t.id === dragTokenId);
    setDragTokenId(null);
    if (!token) return;
    const supabase = createClient();
    supabase
      .from("map_tokens")
      .update({ pos_x: token.pos_x, pos_y: token.pos_y })
      .eq("id", token.id);
  }

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
    <div>
      <div
        ref={containerRef}
        className="relative rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeMap.image_url}
          alt={activeMap.name}
          className="w-full h-auto block pointer-events-none"
          draggable={false}
        />

        {placedTokens.map((token) => {
          const draggable = canDrag(token);
          return (
            <div
              key={token.id}
              onPointerDown={(e) => {
                if (!draggable) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragTokenId(token.id);
              }}
              style={{
                left: `${token.pos_x}%`,
                top: `${token.pos_y}%`,
                backgroundColor: token.image_url ? undefined : colorForToken(token.id),
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-white/80 shadow-lg flex items-center justify-center text-xs font-semibold text-zinc-900 overflow-hidden ${
                draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              }`}
              title={token.label}
            >
              {token.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={token.image_url}
                  alt={token.label}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <span className="pointer-events-none">
                  {token.label.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-1 py-2 text-sm text-zinc-400">{activeMap.name}</div>

      {isMaster && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 space-y-3">
          <form action={createToken} className="flex flex-wrap gap-2 items-center">
            <input type="hidden" name="campaign_id" value={campaignId} />
            <input type="hidden" name="map_id" value={activeMapId ?? ""} />
            <input
              type="text"
              name="label"
              placeholder="Name (z.B. Goblin)"
              required
              className="flex-1 min-w-[120px] rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-zinc-400"
            />
            <input
              type="file"
              name="file"
              accept="image/*"
              className="text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:px-2 file:py-1"
            />
            <button
              type="submit"
              className="text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1.5 font-medium hover:bg-white transition"
            >
              Pin anlegen
            </button>
          </form>

          {unplacedTokens.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">
                Auf die Karte ziehen, um zu platzieren:
              </p>
              <div className="flex flex-wrap gap-2">
                {unplacedTokens.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStartFromList(e, t.id)}
                    style={{
                      backgroundColor: t.image_url ? undefined : colorForToken(t.id),
                    }}
                    className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 cursor-grab active:cursor-grabbing"
                  >
                    <span
                      style={{
                        backgroundColor: t.image_url ? undefined : colorForToken(t.id),
                      }}
                      className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-semibold text-zinc-900 flex-shrink-0"
                    >
                      {t.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.image_url}
                          alt={t.label}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      ) : (
                        t.label.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <span className="text-xs text-zinc-200">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tokens.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-800">
              {tokens.map((t) => (
                <form key={t.id} action={deleteToken}>
                  <input type="hidden" name="campaign_id" value={campaignId} />
                  <input type="hidden" name="token_id" value={t.id} />
                  <button
                    type="submit"
                    className="text-xs rounded-md border border-zinc-800 px-2 py-1 text-zinc-400 hover:text-red-400 hover:border-red-900"
                  >
                    {t.label} ×
                  </button>
                </form>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
