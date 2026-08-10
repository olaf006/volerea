"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateMasterNotes(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const notes = formData.get("notes") as string;

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
        "Nur der Meister hat eigene Notizen."
      )}`
    );
  }

  await supabase
    .from("campaigns")
    .update({ master_notes: notes })
    .eq("id", campaignId);

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}
