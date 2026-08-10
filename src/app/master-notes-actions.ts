"use server";

// Speichert die kategorisierten Notizen des Meisters. Bewusst OHNE
// redirect() - das hatte vorher den Nutzer von der Live-Ansicht zurück
// zur Kampagnen-Seite geschickt. Jetzt bleibt man einfach da, wo man ist.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMasterNotes(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const categoriesJson = formData.get("categories_json") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

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

  if (membership?.role !== "master") return;

  let categories: unknown[] = [];
  try {
    categories = JSON.parse(categoriesJson);
  } catch {
    return;
  }

  await supabase
    .from("campaigns")
    .update({ notes_categories: categories })
    .eq("id", campaignId);

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}
