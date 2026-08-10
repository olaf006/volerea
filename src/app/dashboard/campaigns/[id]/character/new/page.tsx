import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CharacterForm from "@/components/CharacterForm";

export default async function NewCharacterPage({
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

  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, name, mode, house_rules")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  // Falls schon ein Charakter existiert, direkt zurück zur Kampagne
  const { data: existing } = await supabase
    .from("characters")
    .select("id")
    .eq("campaign_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/dashboard/campaigns/${id}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="text-zinc-400 text-sm hover:text-zinc-200"
        >
          ← Zurück zur Kampagne
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-100 mt-2 mb-6">
          Charakter erstellen – {campaign.name}
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2">
            {error}
          </p>
        )}

        <CharacterForm
          campaignId={id}
          isBeginner={campaign.mode === "anfaenger"}
          houseRules={campaign.house_rules ?? ""}
        />
      </div>
    </div>
  );
}
