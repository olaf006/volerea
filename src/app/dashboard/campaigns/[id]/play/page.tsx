import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LiveMapWithTokens from "@/components/LiveMapWithTokens";
import MapSwitcher from "@/components/MapSwitcher";
import DiceRoller from "@/components/DiceRoller";
import LiveDiceFeed from "@/components/LiveDiceFeed";
import SessionGate from "@/components/SessionGate";
import PlayerListPopup from "@/components/PlayerListPopup";
import MasterIntroWrapper from "@/components/MasterIntroWrapper";
import MasterNotesEditor from "@/components/MasterNotesEditor";
import InitiativeTracker from "@/components/InitiativeTracker";
import { endSession, startSession } from "@/app/session-actions";

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

  // Meister-Info holen, damit seine eigenen Würfe im Feed korrekt
  // beschriftet werden (nicht "Jemand würfelt")
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
  // MEISTER-ANSICHT: eigenes Layout mit Notizen, Spielerliste (Popup),
  // eigenem Würfel und Kartenwechsler.
  // ============================================================
  if (isMaster) {
    const { data: characters } = await supabase
      .from("characters")
      .select(
        "id, user_id, name, race, class, level, strength, dexterity, constitution, intelligence, wisdom, charisma, hp_current, hp_max, armor_class, details"
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

    return (
      <MasterIntroWrapper showIntro={intro === "1"}>
        <div className="min-h-screen bg-zinc-950 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <Link
            href={`/dashboard/campaigns/${id}`}
            className="text-zinc-400 text-sm hover:text-zinc-200"
          >
            ← Kampagne
          </Link>
          <span className="text-zinc-100 font-medium text-sm">
            {campaign.name} · Meister-Ansicht
          </span>
          {campaignState?.session_active ? (
            <form action={endSession}>
              <input type="hidden" name="campaign_id" value={id} />
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-300"
              >
                Sitzung beenden
              </button>
            </form>
          ) : (
            <form action={startSession}>
              <input type="hidden" name="campaign_id" value={id} />
              <button
                type="submit"
                className="text-xs rounded-md bg-zinc-100 text-zinc-900 px-3 py-1 font-medium"
              >
                Sitzung starten
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] lg:grid-rows-[auto_1fr_auto_120px] gap-4 p-4 flex-1">
          {/* Kartenwechsler: direkt im Live-Bildschirm, kein Verlassen nötig */}
          <div className="lg:col-start-2 lg:row-start-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <MapSwitcher
              campaignId={id}
              maps={maps ?? []}
              activeMapId={campaignState?.active_map_id ?? null}
            />
          </div>

          {/* Karte: mittig */}
          <div className="lg:col-start-2 lg:row-start-2 min-h-[30vh]">
            <LiveMapWithTokens
              campaignId={id}
              maps={maps ?? []}
              initialActiveMapId={campaignState?.active_map_id ?? null}
              isMaster
              myUserId={user.id}
            />
          </div>

          {/* Würfel + letzte Würfe: darunter */}
          <div className="lg:col-start-2 lg:row-start-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="text-sm font-medium text-zinc-100 mb-3">
                Würfeln
              </h2>
              <DiceRoller campaignId={id} />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="text-sm font-medium text-zinc-100 mb-3">
                Letzte Würfe
              </h2>
              <LiveDiceFeed
                campaignId={id}
                initialRolls={rolls ?? []}
                labels={diceLabels}
              />
            </div>
          </div>

          {/* Notizen: links */}
          <div className="lg:col-start-1 lg:row-start-1 lg:row-span-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col min-h-0">
            <h2 className="text-sm font-medium text-zinc-100 mb-1">
              Meine Notizen
            </h2>
            <p className="text-xs text-zinc-500 mb-3">Nur du siehst das.</p>
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
          </div>

          {/* Spielerliste: rechts, volle Höhe */}
          <div className="lg:col-start-3 lg:row-start-1 lg:row-span-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-medium text-zinc-100 mb-3">
              Spieler
            </h2>
            <PlayerListPopup players={players} />
          </div>

          {/* Unten links: Initiative-Tracker */}
          <div className="hidden lg:flex lg:col-start-1 lg:row-start-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex-col">
            <h2 className="text-sm font-medium text-zinc-100 mb-3">
              Initiative
            </h2>
            <InitiativeTracker
              campaignId={id}
              activeMapId={campaignState?.active_map_id ?? null}
              isMaster
              initialState={combatState ?? null}
            />
          </div>

          {/* Unten rechts (Mitte): noch frei für weitere Werkzeuge */}
          <div className="lg:col-start-2 lg:row-start-4 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-center">
            <p className="text-zinc-600 text-xs text-center">
              Platz für weitere Werkzeuge.
            </p>
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

  const content = (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="text-zinc-400 text-sm hover:text-zinc-200"
        >
          ← Kampagne
        </Link>
        <span className="text-zinc-100 font-medium text-sm">
          {campaign.name}
        </span>
        <span className="w-16" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 min-h-[40vh]">
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

        <div className="lg:w-80 flex flex-col gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-medium text-zinc-100 mb-3">
              Initiative
            </h2>
            <InitiativeTracker
              campaignId={id}
              activeMapId={campaignState?.active_map_id ?? null}
              isMaster={false}
              initialState={combatState ?? null}
            />
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="text-sm font-medium text-zinc-100 mb-3">
              Würfeln
            </h2>
            <DiceRoller campaignId={id} />
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex-1">
            <h2 className="text-sm font-medium text-zinc-100 mb-3">
              Letzte Würfe
            </h2>
            <LiveDiceFeed
              campaignId={id}
              initialRolls={rolls ?? []}
              labels={labels}
            />
          </div>

          {myCharacter && (
            <Link
              href={`/dashboard/campaigns/${id}/character/${myCharacter.id}`}
              className="rounded-md border border-zinc-700 text-center text-zinc-200 px-4 py-2 hover:bg-zinc-800 transition text-sm"
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
