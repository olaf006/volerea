import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteCharacterButton from "@/components/DeleteCharacterButton";
import LiveMapDisplay from "@/components/LiveMapDisplay";
import MapUploadForm from "@/components/MapUploadForm";
import MasterNotesEditor from "@/components/MasterNotesEditor";
import { setActiveMap, clearActiveMap, deleteMap } from "@/app/maps-actions";
import { startSession, endSession } from "@/app/session-actions";

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, description, mode, house_rules, group_id, notes_categories")
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

  const { data: maps } = await supabase
    .from("maps")
    .select("id, name, image_url")
    .eq("campaign_id", id);

  const { data: campaignState } = await supabase
    .from("campaign_state")
    .select("active_map_id, session_active")
    .eq("campaign_id", id)
    .maybeSingle();

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

        {isMaster ? (
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/dashboard/campaigns/${id}/play`}
              className="rounded-md bg-zinc-100 text-zinc-900 font-medium px-4 py-2 hover:bg-white transition text-sm"
            >
              Zum Live-Bildschirm
            </Link>
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
                  className="text-xs rounded-md border border-zinc-700 text-zinc-300 px-3 py-1.5 hover:bg-zinc-800"
                >
                  Kampagne starten
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <Link
              href={`/dashboard/campaigns/${id}/play`}
              className="rounded-md bg-zinc-100 text-zinc-900 font-medium px-4 py-2 hover:bg-white transition text-sm inline-block"
            >
              Jetzt spielen
            </Link>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2">
            {error}
          </p>
        )}

        {/* Karten-Vorschau: kompakt, für alle sichtbar */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">
            Aktive Karte
          </h2>
          <div className="max-h-64 overflow-hidden rounded-lg">
            <LiveMapDisplay
              campaignId={id}
              maps={maps ?? []}
              initialActiveMapId={campaignState?.active_map_id ?? null}
            />
          </div>
        </div>

        {isMaster && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-6 space-y-4">
            <h2 className="text-lg font-medium text-zinc-100">
              Karten verwalten
            </h2>
            <MapUploadForm campaignId={id} />

            {maps && maps.length > 0 && (
              <div className="space-y-2 pt-2">
                {maps.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md border border-zinc-800 px-4 py-2"
                  >
                    <span className="text-sm text-zinc-200">{m.name}</span>
                    <span className="flex items-center gap-2">
                      {campaignState?.active_map_id === m.id ? (
                        <span className="text-xs text-emerald-400">
                          Live
                        </span>
                      ) : (
                        <form action={setActiveMap}>
                          <input type="hidden" name="campaign_id" value={id} />
                          <input type="hidden" name="map_id" value={m.id} />
                          <button
                            type="submit"
                            className="text-xs rounded-md border border-zinc-700 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
                          >
                            Live schalten
                          </button>
                        </form>
                      )}
                      <form action={deleteMap}>
                        <input type="hidden" name="campaign_id" value={id} />
                        <input type="hidden" name="map_id" value={m.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Löschen
                        </button>
                      </form>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {campaignState?.active_map_id && (
              <form action={clearActiveMap}>
                <input type="hidden" name="campaign_id" value={id} />
                <button
                  type="submit"
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Karte ausblenden
                </button>
              </form>
            )}
          </div>
        )}

        {isMaster && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-6">
            <h2 className="text-lg font-medium text-zinc-100 mb-1">
              Meine Notizen
            </h2>
            <p className="text-xs text-zinc-500 mb-3">
              Nur du siehst das. Kannst du schon vor dem Start anlegen und
              später live weiter bearbeiten.
            </p>
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
        )}

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
                      {c.user_id === user?.id || isMaster ? (
                        <Link
                          href={`/dashboard/campaigns/${id}/character/${c.id}`}
                          className="hover:underline"
                        >
                          {c.name}
                        </Link>
                      ) : (
                        c.name
                      )}{" "}
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
