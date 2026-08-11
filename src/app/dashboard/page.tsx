import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth-actions";
import { createGroup, joinGroup } from "@/app/groups-actions";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id)
    .single();

  // Alle Gruppen holen, in denen der Nutzer Mitglied ist, inkl. seiner Rolle
  const { data: memberships } = await supabase
    .from("group_members")
    .select("role, groups(id, name, invite_code)")
    .eq("user_id", user?.id);

  return (
    <div className="min-h-screen bg-tavern-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-2xl mb-1">🏰</p>
            <h1 className="text-2xl font-semibold text-amber-100">
              Willkommen, {profile?.username ?? user?.email}
            </h1>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-tavern-700 px-4 py-2 text-zinc-300 hover:bg-tavern-900 transition text-sm"
            >
              Abmelden
            </button>
          </form>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2">
            {error}
          </p>
        )}

        {/* Deine Gruppen */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 mb-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-medium text-amber-100 mb-4">
            Deine Gruppen
          </h2>

          {!memberships || memberships.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              Du bist noch in keiner Gruppe. Erstell eine neue oder tritt mit
              einem Einladungscode bei.
            </p>
          ) : (
            <ul className="space-y-2">
              {memberships.map((m) => {
                const group = m.groups as unknown as {
                  id: string;
                  name: string;
                  invite_code: string;
                };
                return (
                  <li key={group.id}>
                    <Link
                      href={`/dashboard/groups/${group.id}`}
                      className="flex items-center justify-between rounded-lg border border-tavern-800 px-4 py-3 hover:bg-tavern-800/50 hover:border-amber-800/50 transition"
                    >
                      <span className="text-zinc-100">{group.name}</span>
                      <span className="text-xs uppercase tracking-wide text-zinc-500">
                        {m.role === "master" ? "Meister" : "Spieler"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Neue Gruppe erstellen */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 mb-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-medium text-amber-100 mb-4">
            Neue Gruppe erstellen
          </h2>
          <form action={createGroup} className="flex gap-2">
            <input
              type="text"
              name="name"
              required
              placeholder="z.B. Freitagsrunde"
              className="flex-1 rounded-lg bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-500 text-tavern-950 font-medium px-4 py-2 hover:bg-amber-400 transition"
            >
              Erstellen
            </button>
          </form>
        </div>

        {/* Gruppe beitreten */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-medium text-amber-100 mb-4">
            Gruppe beitreten
          </h2>
          <form action={joinGroup} className="flex gap-2">
            <input
              type="text"
              name="invite_code"
              required
              placeholder="Einladungscode"
              className="flex-1 rounded-lg bg-tavern-950 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="rounded-lg border border-tavern-700 text-zinc-200 font-medium px-4 py-2 hover:bg-tavern-800 transition"
            >
              Beitreten
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
