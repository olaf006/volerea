import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteCharacterButton from "@/components/DeleteCharacterButton";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, description, mode, house_rules, group_id")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: group } = await supabase
    .from("groups")
    .select("owner_id")
    .eq("id", campaign.group_id)
    .single();

  const isMaster = group?.owner_id === user?.id;

  const { data: characters } = await supabase
    .from("characters")
    .select("id, name, race, class, level, user_id, profiles(username)")
    .eq("campaign_id", id);

  const myCharacter = characters?.find((c) => c.user_id === user?.id);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/groups/${campaign.group_id}`}
          className="text-zinc-400 text-sm hover:text-zinc-200"
        >
          ← Zurück zur Gruppe
        </Link>

        <div className="flex items-center gap-3 mt-2 mb-1">
          <h1 className="text-2xl font-semibold text-zinc-100">
            {campaign.name}
          </h1>
          <span className="text-xs uppercase tracking-wide rounded-full border border-zinc-700 px-2 py-0.5 text-zinc-400">
            {campaign.mode === "anfaenger" ? "Anfänger-Modus" : "Normal"}
          </span>
        </div>

        {campaign.description && (
          <p className="text-zinc-400 mb-6">{campaign.description}</p>
        )}

        {campaign.house_rules && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-6">
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              Hausregeln
            </h2>
            <p className="text-zinc-300 whitespace-pre-wrap">
              {campaign.house_rules}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
            Charaktere
          </h2>

          {!characters || characters.length === 0 ? (
            <p className="text-zinc-400 text-sm mb-4">
              Noch keine Charaktere erstellt.
            </p>
          ) : (
            <ul className="space-y-2 mb-4">
              {characters.map((c) => {
                const p = c.profiles as unknown as { username: string } | null;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md border border-zinc-800 px-4 py-3"
                  >
                    <span className="text-zinc-100">
                      <Link
                        href={`/dashboard/campaigns/${id}/character/${c.id}`}
                        className="hover:underline"
                      >
                        {c.name}
                      </Link>{" "}
                      <span className="text-zinc-500 text-sm">
                        ({c.race} {c.class}, Stufe {c.level})
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">
                        {p?.username}
                      </span>
                      {(c.user_id === user?.id || isMaster) && (
                        <DeleteCharacterButton
                          characterId={c.id}
                          campaignId={id}
                          characterName={c.name}
                        />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {!isMaster && !myCharacter && (
            <Link
              href={`/dashboard/campaigns/${id}/character/new`}
              className="inline-block rounded-md bg-zinc-100 text-zinc-900 font-medium px-4 py-2 hover:bg-white transition text-sm"
            >
              Charakter erstellen
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
