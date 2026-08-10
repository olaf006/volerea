"use server";

// Server Actions rund um Karten: hochladen, live schalten, löschen.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadMap(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        "Bitte eine Bilddatei auswählen."
      )}`
    );
  }

  const supabase = await createClient();

  const fileExt = file.name.split(".").pop();
  const path = `${campaignId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("maps")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        uploadError.message
      )}`
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("maps").getPublicUrl(path);

  const { error } = await supabase.from("maps").insert({
    campaign_id: campaignId,
    name: name || "Unbenannte Karte",
    image_url: publicUrl,
  });

  if (error) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function setActiveMap(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const mapId = formData.get("map_id") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("campaign_state")
    .upsert(
      { campaign_id: campaignId, active_map_id: mapId, updated_at: new Date().toISOString() },
      { onConflict: "campaign_id" }
    );

  if (error) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function clearActiveMap(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const supabase = await createClient();

  await supabase
    .from("campaign_state")
    .upsert(
      { campaign_id: campaignId, active_map_id: null, updated_at: new Date().toISOString() },
      { onConflict: "campaign_id" }
    );

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function deleteMap(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const mapId = formData.get("map_id") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("maps").delete().eq("id", mapId);

  if (error) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}
