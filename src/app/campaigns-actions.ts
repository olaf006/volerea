"use server";

// Server Action zum Erstellen einer Kampagne innerhalb einer Gruppe.
// Nur der Meister der Gruppe darf das (abgesichert über RLS-Regel
// "campaigns_insert_master").

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
  const groupId = formData.get("group_id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const mode = formData.get("mode") as string;
  const houseRules = formData.get("house_rules") as string;

  const supabase = await createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      group_id: groupId,
      name,
      description,
      mode,
      house_rules: houseRules,
    })
    .select()
    .single();

  if (error) {
    redirect(
      `/dashboard/groups/${groupId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
  redirect(`/dashboard/campaigns/${campaign.id}`);
}
