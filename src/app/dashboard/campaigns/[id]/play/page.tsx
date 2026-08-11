import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LiveMapWithTokens from "@/components/LiveMapWithTokens";
import MasterSidebar from "@/components/MasterSidebar";
import MapSwitcher from "@/components/MapSwitcher";
import DiceRoller from "@/components/DiceRoller";
import LiveDiceFeed from "@/components/LiveDiceFeed";
import SessionGate from "@/components/SessionGate";
import PlayerListPopup from "@/components/PlayerListPopup";
import MasterIntroWrapper from "@/components/MasterIntroWrapper";
import MasterNotesEditor from "@/components/MasterNotesEditor";
import InitiativeTracker from "@/components/InitiativeTracker";
import AttackPanel from "@/components/AttackPanel";
import MasterAttackPanel from "@/components/MasterAttackPanel";
import NpcManagerPanel from "@/components/NpcManagerPanel";
import LevelUpBanner from "@/components/LevelUpBanner";
import LevelUpWatcher from "@/components/LevelUpWatcher";
import { endSession, startSession } from "@/app/session-actions";
import { InventoryItem } from "@/lib/dnd-data";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ intro?: string }>;
}) {
  const { id } = await params;
  const { intro } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, group_id, notes_categories")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", campaign.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) notFound();

  const isMaster = membership.role === "master";

  const { data: maps } = await supabase
    .from("maps")
    .select("id, name, image_url")
    .eq("campaign_id", id);

  const { data: campaignState } = await supabase
    .from("campaign_state")
    .select("active_map_id, session_active")
    .eq("campaign_id", id)
    .maybeSingle();

  const { data: rolls } = await supabase
    .from("dice_rolls")
    .select("id, user_id, dice, result, created_at")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

  const { data: masterMembership } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", campaign.group_id)
    .eq("role", "master")
    .maybeSingle();

  const { data: combatState } = await supabase
    .from("combat_state")
    .select("turn_order, current_index, active")
    .eq("campaign_id", id)
    .maybeSingle();

  // ============================================================
  // MEISTER-ANSICHT: kompaktes 2-Zeilen-Layout, jedes Fach scrollt für
  // sich selbst statt die ganze Seite scrollen zu lassen.
  // ============================================================
  if (isMaster) {
    const { data: characters } = await supabase
      .from("characters")
      .select(
        "id, user_id, name, race, class, level, xp, strength, dexterity, constitution, intelligence, wisdom, charisma, hp_current, hp_max, armor_class, details"
      )
      .eq("campaign_id", id);

    const { data: members } = await supabase
      .from("group_members")
      .select("user_id, role, profiles(username)")
      .eq("group_id", campaign.group_id);

    const diceLabels: Record<string, string> = {};
    characters?.forEach((c) => {
      diceLabels[c.user_id] = c.name;
    });
    if (masterMembership) diceLabels[masterMembership.user_id] = "Spielleiter";

    const players =
      members
        ?.filter((m) => m.role === "player")
        .map((m) => {
          const p = m.profiles as unknown as { username: string } | null;
          const character = characters?.find((c) => c.user_id === m.user_id) ?? null;
          return {
            userId: m.user_id,
            username: p?.username ?? "Unbekannt",
            character: character as never,
          };
        }) ?? [];

    const characterLookup: Record<string, { id: string; name: string }> = {};
    characters?.forEach((c) => {
      characterLookup[c.user_id] = { id: c.id, name: c.name };
    });

    return (
      <MasterIntroWrapper showIntro={intro === "1"}>
        <div className="h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex flex-col overflow-hidden">
          <LevelUpBanner campaignId={id} />
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-900/30 bg-tavern-950/60 flex-shrink-0">
            <Link
              href={`/dashboard/campaigns/${id}`}
              className="text-zinc-400 text-xs hover:text-amber-300 transition"
            >
              ← Kampagne
            </Link>
            <span className="text-amber-200 font-medium text-sm tracking-wide">
              {campaign.name}
            </span>
            {campaignState?.session_active ? (
              <form action={endSession}>
                <input type="hidden" name="campaign_id" value={id} />
                <button type="submit" className="text-xs text-red-400 hover:text-red-300">
                  Sitzung beenden
                </button>
              </form>
            ) : (
              <form action={startSession}>
                <input type="hidden" name="campaign_id" value={id} />
                <button
                  type="submit"
                  className="text-xs rounded-md bg-amber-600 text-zinc-950 px-3 py-1.5 font-medium hover:bg-amber-500 transition"
                >
                  Sitzung starten
                </button>
              </form>
            )}
          </div>

          <div className="flex-1 min-h-0 p-3 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 min-h-0">
              <LiveMapWithTokens
                campaignId={id}
                maps={maps ?? []}
                initialActiveMapId={campaignState?.active_map_id ?? null}
                isMaster
                myUserId={user.id}
              />
            </div>

            <div className="lg:w-96 h-64 lg:h-full flex-shrink-0">
              <MasterSidebar
                mapContent={
                  <MapSwitcher
                    campaignId={id}
                    maps={maps ?? []}
                    activeMapId={campaignState?.active_map_id ?? null}
                  />
                }
                npcContent={
                  <NpcManagerPanel
                    campaignId={id}
                    activeMapId={campaignState?.active_map_id ?? null}
                  />
                }
                attackContent={
                  <MasterAttackPanel
                    campaignId={id}
                    activeMapId={campaignState?.active_map_id ?? null}
                    characterLookup={characterLookup}
                  />
                }
                notesContent={
                  <MasterNotesEditor
                    campaignId={id}
                    initialCategories={
                      (campaign.notes_categories as {
                        id: string;
                        title: string;
                        content: string;
                      }[]) ?? []
                    }
                  />
                }
                playersContent={
                  <PlayerListPopup players={players} campaignId={id} currentUserId={user.id} />
                }
                initiativeContent={
                  <InitiativeTracker
                    campaignId={id}
                    activeMapId={campaignState?.active_map_id ?? null}
                    isMaster
                    initialState={combatState ?? null}
                  />
                }
                diceContent={
                  <div className="space-y-3">
                    <DiceRoller campaignId={id} />
                    <LiveDiceFeed
                      campaignId={id}
                      initialRolls={rolls ?? []}
                      labels={diceLabels}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </MasterIntroWrapper>
    );
  }

  // ============================================================
  // SPIELER-ANSICHT: großer Live-Bildschirm, Lobby bis Meister startet.
  // ============================================================
  const { data: characters } = await supabase
    .from("characters")
    .select("id, user_id, name, details")
    .eq("campaign_id", id);

  const labels: Record<string, string> = {};
  characters?.forEach((c) => {
    labels[c.user_id] = c.name;
  });
  if (masterMembership) labels[masterMembership.user_id] = "Spielleiter";

  const myCharacter = characters?.find((c) => c.user_id === user.id);
  const myCharacterDetails = (myCharacter?.details ?? {}) as Record<string, unknown>;
  const myCharacterImage =
    typeof myCharacterDetails.tokenImage === "string"
      ? myCharacterDetails.tokenImage
      : undefined;
  const myWeapons = ((myCharacterDetails.inventory as InventoryItem[]) ?? [])
    .filter((item) => item.damage)
    .map((item) => ({ name: item.name, damage: item.damage! }));

  const content = (
    <div className="h-screen bg-tavern-950 flex flex-col overflow-hidden">
      <LevelUpBanner campaignId={id} />
      {myCharacter && <LevelUpWatcher campaignId={id} characterId={myCharacter.id} />}
      <div className="flex items-center justify-between px-3 py-2 border-b border-tavern-800 flex-shrink-0">
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="text-zinc-400 text-xs hover:text-zinc-200"
        >
          ← Kampagne
        </Link>
        <span className="text-zinc-100 font-medium text-xs">{campaign.name}</span>
        <span className="w-12" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 overflow-hidden min-h-0">
        <div className="flex-1 min-h-0 lg:min-h-full overflow-y-auto">
          <LiveMapWithTokens
            campaignId={id}
            maps={maps ?? []}
            initialActiveMapId={campaignState?.active_map_id ?? null}
            isMaster={false}
            myUserId={user.id}
            myCharacterLabel={myCharacter?.name}
            myCharacterImage={myCharacterImage}
          />
        </div>

        <div className="lg:w-72 flex flex-col gap-2 overflow-y-auto min-h-0">
          <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-3 flex-shrink-0">
            <h2 className="text-xs font-medium text-zinc-100 mb-2">Angriff</h2>
            <AttackPanel
              campaignId={id}
              activeMapId={campaignState?.active_map_id ?? null}
              weapons={myWeapons}
            />
          </div>

          <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-3 flex-shrink-0">
            <h2 className="text-xs font-medium text-zinc-100 mb-2">Initiative</h2>
            <InitiativeTracker
              campaignId={id}
              activeMapId={campaignState?.active_map_id ?? null}
              isMaster={false}
              initialState={combatState ?? null}
            />
          </div>

          <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-3 flex-shrink-0">
            <h2 className="text-xs font-medium text-zinc-100 mb-2">Würfeln</h2>
            <DiceRoller campaignId={id} />
          </div>

          <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-3">
            <h2 className="text-xs font-medium text-zinc-100 mb-2">Letzte Würfe</h2>
            <LiveDiceFeed campaignId={id} initialRolls={rolls ?? []} labels={labels} />
          </div>

          {myCharacter && (
            <Link
              href={`/dashboard/campaigns/${id}/character/${myCharacter.id}`}
              className="rounded-md border border-tavern-700 text-center text-zinc-200 px-4 py-2 hover:bg-tavern-800 transition text-sm flex-shrink-0"
            >
              Mein Charakter & Inventar
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <SessionGate
      campaignId={id}
      initialActive={campaignState?.session_active ?? false}
      campaignName={campaign.name}
    >
      {content}
    </SessionGate>
  );
}
