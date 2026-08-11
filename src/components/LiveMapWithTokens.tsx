"use client";

// Live-Karte mit Pins (wie Google-Maps-Marker). Pins verschieben läuft
// über Pointer-Events (funktioniert auf Maus UND Touch).
//
// WICHTIG zur Positionierung: Pins werden in Prozent relativ zum BILD
// gespeichert (nicht zum umgebenden Kasten) - wir berechnen dafür immer
// die tatsächliche Bild-Box innerhalb des Containers (unter
// Berücksichtigung von Letterboxing durch object-contain). Das ist
// nötig, weil Meister- und Spieler-Bildschirm unterschiedlich große
// Kästen um die Karte haben - ohne diese Berechnung würden Pins bei
// unterschiedlichen Seitenverhältnissen leicht verschoben erscheinen.

import { useEffect, useRef, useState } from "react";
import { createClient, createAuthedRealtimeClient } from "@/lib/supabase/client";
import { updateTokenHp } from "@/app/combat-actions";
import { deleteToken } from "@/app/tokens-actions";
import { useOnlineUsers } from "@/lib/usePresence";

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
  hp_current: number | null;
  hp_max: number | null;
  details: {
    weapon?: { name: string; damage: string } | null;
    loot?: string | null;
    ac?: number | null;
  } | null;
}

function colorForToken(id: string) {
  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#818cf8", "#e879f9"];
  let hash = 0;
  for (const char of id) hash = (hash + char.charCodeAt(0)) % colors.length;
  return colors[hash];
}

function TokenIcon({ token }: { token: Token }) {
  if (token.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={token.image_url}
        alt={token.label}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    );
  }
  return (
    <span
      style={{ backgroundColor: colorForToken(token.id) }}
      className="w-full h-full flex items-center justify-center pointer-events-none"
    >
      {token.label.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function LiveMapWithTokens({
  campaignId,
  maps,
  initialActiveMapId,
  isMaster,
  myUserId,
  myCharacterLabel,
  myCharacterImage,
}: {
  campaignId: string;
  maps: MapInfo[];
  initialActiveMapId: string | null;
  isMaster: boolean;
  myUserId: string;
  myCharacterLabel?: string;
  myCharacterImage?: string;
}) {
  const [activeMapId, setActiveMapId] = useState(initialActiveMapId);
  const [tokens, setTokens] = useState<Token[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const tapStartClient = useRef<{ x: number; y: number } | null>(null);
  const [hpEditTokenId, setHpEditTokenId] = useState<string | null>(null);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const activeMap = maps.find((m) => m.id === activeMapId);
  const onlineUsers = useOnlineUsers(campaignId, myUserId);

  // NPCs (kein Besitzer) immer anzeigen, Spieler-Pins nur wenn der
  // Spieler gerade wirklich online auf dem Live-Bildschirm ist.
  const visibleTokens = tokens.filter(
    (t) => t.owner_user_id === null || onlineUsers.has(t.owner_user_id) || t.owner_user_id === myUserId
  );

  useEffect(() => {
    setNaturalSize(null);
  }, [activeMapId]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function getImageBox() {
    // Solange die echte Bildgröße noch nicht bekannt ist (kurz nach dem
    // Laden), rechnen wir übergangsweise so, als würde das Bild den
    // ganzen Kasten ausfüllen - damit lässt sich sofort ziehen, statt
    // dass gar nichts passiert. Sobald die echten Maße da sind, wird's
    // automatisch präziser.
    if (!naturalSize || containerSize.w === 0 || containerSize.h === 0) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { offsetX: 0, offsetY: 0, renderedW: rect.width, renderedH: rect.height };
        }
      }
      return null;
    }
    const scale = Math.min(
      containerSize.w / naturalSize.w,
      containerSize.h / naturalSize.h
    );
    const renderedW = naturalSize.w * scale;
    const renderedH = naturalSize.h * scale;
    return {
      offsetX: (containerSize.w - renderedW) / 2,
      offsetY: (containerSize.h - renderedH) / 2,
      renderedW,
      renderedH,
    };
  }

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
          (payload: any) => {
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

  useEffect(() => {
    if (!activeMapId) {
      setTokens([]);
      return;
    }
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("map_tokens")
        .select("id, map_id, owner_user_id, label, image_url, pos_x, pos_y, placed, hp_current, hp_max, details")
        .eq("map_id", activeMapId)
        .eq("placed", true);
      if (error) console.error("Pins konnten nicht geladen werden:", error.message);
      if (!active) return;

      let currentTokens = data ?? [];
      setTokens(currentTokens);

      if (!isMaster && myCharacterLabel) {
        const alreadyExists = currentTokens.some((t: any) => t.owner_user_id === myUserId);
        if (!alreadyExists) {
          const { data: inserted, error: insertError } = await supabase
            .from("map_tokens")
            .upsert(
              {
                campaign_id: campaignId,
                map_id: activeMapId,
                owner_user_id: myUserId,
                label: myCharacterLabel,
                image_url: myCharacterImage ?? null,
                pos_x: 50,
                pos_y: 50,
                placed: true,
              },
              { onConflict: "map_id,owner_user_id" }
            )
            .select()
            .maybeSingle();

          if (insertError) {
            console.error("Eigener Pin konnte nicht angelegt werden:", insertError.message);
          } else if (inserted && active) {
            currentTokens = [...currentTokens, inserted];
            setTokens(currentTokens);
          }
        }
      }

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
          (payload: any) => {
            if (payload.eventType === "INSERT") {
              const newToken = payload.new as Token;
              if (!newToken.placed) return;
              setTokens((prev) => {
                if (prev.some((t) => t.id === newToken.id)) return prev;
                return [...prev, newToken];
              });
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as Token;
              setTokens((prev) => {
                if (!updated.placed) return prev.filter((t) => t.id !== updated.id);
                const exists = prev.some((t) => t.id === updated.id);
                if (exists) return prev.map((t) => (t.id === updated.id ? updated : t));
                return [...prev, updated];
              });
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
  }, [activeMapId, isMaster, myUserId, myCharacterLabel, myCharacterImage, campaignId]);

  function canDrag(token: Token) {
    return isMaster || token.owner_user_id === myUserId;
  }

  function posFromEvent(e: { clientX: number; clientY: number }) {
    if (!containerRef.current) return null;
    const box = getImageBox();
    if (!box) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left - box.offsetX;
    const localY = e.clientY - rect.top - box.offsetY;
    const inside = localX >= 0 && localX <= box.renderedW && localY >= 0 && localY <= box.renderedH;
    const x = Math.min(100, Math.max(0, (localX / box.renderedW) * 100));
    const y = Math.min(100, Math.max(0, (localY / box.renderedH) * 100));
    return { x, y, inside };
  }

  function pixelPosFor(token: Token) {
    const box = getImageBox();
    if (!box) return { left: `${token.pos_x}%`, top: `${token.pos_y}%` };
    return {
      left: `${box.offsetX + (token.pos_x / 100) * box.renderedW}px`,
      top: `${box.offsetY + (token.pos_y / 100) * box.renderedH}px`,
    };
  }

  // WICHTIG: tokensRef hält den aktuellen Stand für die Zieh-Handler,
  // damit die Ereignisüberwachung unten NICHT bei jeder einzelnen
  // Positionsänderung neu aufgebaut werden muss (das war der Bug, der
  // gelegentlich zu "Pin lässt sich nicht mehr bewegen" führte).
  const tokensRef = useRef<Token[]>([]);
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  useEffect(() => {
    if (!draggingId) return;

    function handleMove(e: PointerEvent) {
      const pos = posFromEvent(e);
      if (!pos) return;
      setTokens((prev) =>
        prev.map((t) => (t.id === draggingId ? { ...t, pos_x: pos.x, pos_y: pos.y } : t))
      );
    }

    function handleUp(e: PointerEvent) {
      const pos = posFromEvent(e);
      const supabase = createClient();
      const start = tapStartClient.current;
      const movedPixels = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 999;
      const wasTap = movedPixels < 6;

      const token = tokensRef.current.find((t) => t.id === draggingId);

      if (wasTap && token) {
        if (dragStartPos.current) {
          const orig = dragStartPos.current;
          setTokens((prev) =>
            prev.map((t) => (t.id === token.id ? { ...t, pos_x: orig.x, pos_y: orig.y } : t))
          );
        }
        if (token.owner_user_id === null) {
          setHpEditTokenId(token.id);
        }
      } else if (pos?.inside && token) {
        supabase
          .from("map_tokens")
          .update({ pos_x: token.pos_x, pos_y: token.pos_y })
          .eq("id", token.id)
          .then(({ error }: any) => {
            if (error) console.error("Pin-Position konnte nicht gespeichert werden:", error.message);
          });
      } else if (token) {
        if (isMaster && token.owner_user_id === null) {
          if (confirm(`${token.label} wirklich von der Karte entfernen?`)) {
            const formData = new FormData();
            formData.set("campaign_id", campaignId);
            formData.set("token_id", token.id);
            deleteToken(formData);
          } else if (dragStartPos.current) {
            const orig = dragStartPos.current;
            setTokens((prev) =>
              prev.map((t) => (t.id === token.id ? { ...t, pos_x: orig.x, pos_y: orig.y } : t))
            );
          }
        } else if (dragStartPos.current) {
          const orig = dragStartPos.current;
          setTokens((prev) =>
            prev.map((t) => (t.id === token.id ? { ...t, pos_x: orig.x, pos_y: orig.y } : t))
          );
        }
      }

      setDraggingId(null);
      dragStartPos.current = null;
      tapStartClient.current = null;
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId]);

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
    <div className="h-full flex flex-col">
      <div
        ref={containerRef}
        className="relative rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden select-none touch-none flex-1"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={(img) => {
            if (img && img.complete && img.naturalWidth > 0) {
              setNaturalSize((prev) =>
                prev?.w === img.naturalWidth && prev?.h === img.naturalHeight
                  ? prev
                  : { w: img.naturalWidth, h: img.naturalHeight }
              );
            }
          }}
          src={activeMap.image_url}
          alt={activeMap.name}
          className="w-full h-full object-contain block pointer-events-none"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />

        {visibleTokens.map((token) => {
          const draggable = canDrag(token);
          const isBeingDragged = draggingId === token.id;
          const pos = pixelPosFor(token);
          return (
            <div
              key={token.id}
              onPointerDown={(e) => {
                if (!draggable) return;
                e.preventDefault();
                dragStartPos.current = { x: token.pos_x, y: token.pos_y };
                tapStartClient.current = { x: e.clientX, y: e.clientY };
                setDraggingId(token.id);
              }}
              style={pos}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 ${
                draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              } ${isBeingDragged ? "z-20 scale-110" : "z-10"}`}
              title={token.label}
            >
              <div className="w-full h-full rounded-full border-2 border-white/80 shadow-lg text-xs font-semibold text-zinc-900 overflow-hidden">
                <TokenIcon token={token} />
              </div>
              {token.hp_max !== null && token.hp_max > 0 && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 pointer-events-none">
                  <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, ((token.hp_current ?? 0) / token.hp_max) * 100))}%`,
                        backgroundColor:
                          (token.hp_current ?? 0) / token.hp_max > 0.5
                            ? "#4ade80"
                            : (token.hp_current ?? 0) / token.hp_max > 0.25
                            ? "#facc15"
                            : "#f87171",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isMaster && (
        <p className="text-center text-xs text-zinc-600 pt-1">
          NPC vom Bild ziehen, um ihn zu entfernen.
        </p>
      )}

      {hpEditTokenId && (() => {
        const token = tokens.find((t) => t.id === hpEditTokenId);
        if (!token) return null;
        return (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setHpEditTokenId(null)}
          >
            <div
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-full max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-zinc-100 font-medium mb-3">{token.label} · HP</h3>
              {(token.details?.weapon || token.details?.loot || token.details?.ac) && (
                <div className="mb-3 text-xs text-zinc-400 space-y-0.5">
                  {token.details?.weapon && (
                    <p>
                      <span className="text-zinc-500">Waffe: </span>
                      {token.details.weapon.name} ({token.details.weapon.damage})
                    </p>
                  )}
                  {token.details?.ac != null && (
                    <p>
                      <span className="text-zinc-500">Rüstungsklasse: </span>
                      {token.details.ac}
                    </p>
                  )}
                  {token.details?.loot && (
                    <p>
                      <span className="text-zinc-500">Loot: </span>
                      {token.details.loot}
                    </p>
                  )}
                </div>
              )}
              <form
                action={updateTokenHp}
                onSubmit={() => setHpEditTokenId(null)}
                className="space-y-3"
              >
                <input type="hidden" name="campaign_id" value={campaignId} />
                <input type="hidden" name="token_id" value={token.id} />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="hp_current"
                    defaultValue={token.hp_current ?? 10}
                    className="w-20 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-center"
                  />
                  <span className="text-zinc-500">/</span>
                  <input
                    type="number"
                    name="hp_max"
                    defaultValue={token.hp_max ?? 10}
                    className="w-20 rounded-md bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-zinc-100 text-center"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-zinc-100 text-zinc-900 font-medium px-3 py-1.5 text-sm hover:bg-white transition"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => setHpEditTokenId(null)}
                    className="rounded-md border border-zinc-700 text-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-800 transition"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
