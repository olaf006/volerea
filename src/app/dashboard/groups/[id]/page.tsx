import { createClient } from "@/lib/supabase/server";
import { createCampaign } from "@/app/campaigns-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupPage({
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

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, invite_code, owner_id")
    .eq("id", id)
    .single();

  if (!group) notFound();

  const isMaster = group.owner_id === user?.id;

  const { data: members } = await supabase
    .from("group_members")
    .select("role, user_id, profiles(username)")
    .eq("group_id", id);

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, description")
    .eq("group_id", id);

  return (
    <div className="min-h-screen bg-tavern-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-zinc-400 text-sm hover:text-zinc-200">
          ← Zurück zum Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-amber-100 mt-2 mb-6">
          {group.name}
        </h1>

        {isMaster && (
          <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6">
            <h2 className="text-lg font-medium text-amber-100 mb-2">
              Einladungscode
            </h2>
            <p className="text-zinc-400 text-sm mb-3">
              Gib diesen Code an deine Mitspieler weiter, damit sie beitreten
              können.
            </p>
            <code className="block rounded-md bg-tavern-950 border border-tavern-700 px-4 py-2 text-zinc-100 text-lg tracking-wider">
              {group.invite_code}
            </code>
          </div>
        )}

        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6">
          <h2 className="text-lg font-medium text-amber-100 mb-4">
            Mitglieder
          </h2>
          <ul className="space-y-2">
            {members?.map((m) => {
              const p = m.profiles as unknown as { username: string } | null;
              return (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-200">
                    {p?.username ?? "Unbekannt"}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-zinc-500">
                    {m.role === "master" ? "Meister" : "Spieler"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2">
            {error}
          </p>
        )}

        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6">
          <h2 className="text-lg font-medium text-amber-100 mb-4">
            Kampagnen
          </h2>
          {!campaigns || campaigns.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              Noch keine Kampagne angelegt.
            </p>
          ) : (
            <ul className="space-y-2">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    className="block rounded-md border border-tavern-800 px-4 py-3 text-zinc-100 hover:bg-tavern-800/50 transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {isMaster && (
          <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20">
            <h2 className="text-lg font-medium text-amber-100 mb-1">
              Neue Kampagne erstellen
            </h2>
            <p className="text-zinc-400 text-sm mb-4">
              Wähl einen Modus. Im Anfänger-Modus bekommen deine Spieler beim
              Charaktererstellen Erklärungen und Hilfestellungen.
            </p>

            <form action={createCampaign} className="space-y-4">
              <input type="hidden" name="group_id" value={id} />

              <div>
                <label className="block text-sm text-zinc-300 mb-1">
                  Name der Kampagne
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="z.B. Der Fluch von Rieselfeld"
                  className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Kurzer Überblick, worum es geht..."
                  className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">
                  Modus
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 rounded-md border border-tavern-700 px-4 py-3 cursor-pointer has-[:checked]:border-zinc-300 has-[:checked]:bg-tavern-800">
                    <span className="flex items-center gap-2 text-zinc-100 font-medium">
                      <input
                        type="radio"
                        name="mode"
                        value="normal"
                        defaultChecked
                      />
                      Normal
                    </span>
                    <span className="text-xs text-zinc-400">
                      Für erfahrene Spieler, keine Hilfestellungen.
                    </span>
                  </label>
                  <label className="flex flex-col gap-1 rounded-md border border-tavern-700 px-4 py-3 cursor-pointer has-[:checked]:border-zinc-300 has-[:checked]:bg-tavern-800">
                    <span className="flex items-center gap-2 text-zinc-100 font-medium">
                      <input type="radio" name="mode" value="anfaenger" />
                      Anfänger
                    </span>
                    <span className="text-xs text-zinc-400">
                      Mit Erklärungen beim Charaktererstellen.
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1">
                  Hausregeln (optional)
                </label>
                <textarea
                  name="house_rules"
                  rows={3}
                  placeholder="Besondere Regeln, Monster-Mischung, Einschränkungen bei Rassen/Klassen, etc."
                  className="w-full rounded-md bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Deine Spieler sehen das beim Erstellen ihres Charakters.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium py-2 hover:bg-amber-400 transition"
              >
                Kampagne erstellen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
