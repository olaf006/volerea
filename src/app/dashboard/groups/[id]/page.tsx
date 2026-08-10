import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-zinc-400 text-sm hover:text-zinc-200">
          ← Zurück zum Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-100 mt-2 mb-6">
          {group.name}
        </h1>

        {isMaster && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-6">
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              Einladungscode
            </h2>
            <p className="text-zinc-400 text-sm mb-3">
              Gib diesen Code an deine Mitspieler weiter, damit sie beitreten
              können.
            </p>
            <code className="block rounded-md bg-zinc-950 border border-zinc-700 px-4 py-2 text-zinc-100 text-lg tracking-wider">
              {group.invite_code}
            </code>
          </div>
        )}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
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

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
            Kampagnen
          </h2>
          {!campaigns || campaigns.length === 0 ? (
            <p className="text-zinc-400 text-sm">
              Noch keine Kampagne angelegt.
            </p>
          ) : (
            <ul className="space-y-2">
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md border border-zinc-800 px-4 py-3 text-zinc-100"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
