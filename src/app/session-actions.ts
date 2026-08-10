"use server";

// Server Actions für die Live-Sitzung: Kampagne starten/beenden (Meister)
// und würfeln (alle Gruppenmitglieder).

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireMaster(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("group_id")
    .eq("id", campaignId)
    .single();

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", campaign?.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.role !== "master") {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        "Das darf nur der Meister der Gruppe."
      )}`
    );
  }

  return supabase;
}

export async function startSession(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const supabase = await requireMaster(campaignId);

  await supabase.from("campaign_state").upsert(
    {
      campaign_id: campaignId,
      session_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "campaign_id" }
  );

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}/play`);
}

export async function endSession(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const supabase = await requireMaster(campaignId);

  await supabase.from("campaign_state").upsert(
    {
      campaign_id: campaignId,
      session_active: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "campaign_id" }
  );

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function rollDice(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const dice = formData.get("dice") as string; // z.B. "W20"
  const sides = Number(dice.replace("W", ""));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = Math.floor(Math.random() * sides) + 1;

  await supabase.from("dice_rolls").insert({
    campaign_id: campaignId,
    user_id: user.id,
    dice,
    result,
  });

  // Kein redirect - der Client aktualisiert sich über Realtime selbst
}
