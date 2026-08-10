import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth-actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Willkommen, {profile?.username ?? user?.email}
            </h1>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-900 transition text-sm"
            >
              Abmelden
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-300">
            Hier kommt als nächstes deine Gruppen-Übersicht hin.
          </p>
        </div>
      </div>
    </div>
  );
}
