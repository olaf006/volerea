import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import LiveMapDisplay from "@/components/LiveMapDisplay";
import DiceRoller from "@/components/DiceRoller";
import LiveDiceFeed from "@/components/LiveDiceFeed";
import SessionGate from "@/components/SessionGate";
import { endSession } from "@/app/session-actions";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, group_id")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", campaign.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) notFound(); // kein Mitglied dieser Gruppe

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

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(username)")
    .eq("group_id", campaign.group_id);

  const usernames: Record<string, string> = {};
  members?.forEach((m) => {
    const p = m.profiles as unknown as { username: string } | null;
    if (p) usernames[m.user_id] = p.username;
  });

  const { data: rolls } = await supabase
    .from("dice_rolls")
    .select("id, user_id, dice, result, created_at")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

  const { data: myCharacter } = await supabase
    .from("characters")
    .select("id")
    .eq("campaign_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const content = (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Kopfzeile */}
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
        {isMaster ? (
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
          <span className="w-16" />
        )}
      </div>

      {/* Hauptbereich: Karte groß, Werkzeuge daneben/darunter */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 min-h-[40vh]">
          <LiveMapDisplay
            campaignId={id}
            maps={maps ?? []}
            initialActiveMapId={campaignState?.active_map_id ?? null}
          />
        </div>

        <div className="lg:w-80 flex flex-col gap-4">
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
              usernames={usernames}
            />
          </div>

          <Link
            href={
              myCharacter
                ? `/dashboard/campaigns/${id}/character/${myCharacter.id}`
                : `/dashboard/campaigns/${id}`
            }
            className="rounded-md border border-zinc-700 text-center text-zinc-200 px-4 py-2 hover:bg-zinc-800 transition text-sm"
          >
            Mein Charakter & Inventar
          </Link>
        </div>
      </div>
    </div>
  );

  if (isMaster) {
    return content;
  }

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
