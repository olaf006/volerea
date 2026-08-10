"use server";

// Server Actions rund um Karten: hochladen, live schalten, löschen.
// Jede Aktion prüft serverseitig, ob der Nutzer wirklich Meister der
// Gruppe ist - das darf sich nicht nur auf die Oberfläche verlassen.

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

  const supabase = await requireMaster(campaignId);

  const fileExt = file.name.split(".").pop();
  const path = `${campaignId}/${Date.now()}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("maps")
    .upload(path, arrayBuffer, { contentType: file.type });

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

  const supabase = await requireMaster(campaignId);

  const { error } = await supabase.from("campaign_state").upsert(
    {
      campaign_id: campaignId,
      active_map_id: mapId,
      updated_at: new Date().toISOString(),
    },
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
  const supabase = await requireMaster(campaignId);

  await supabase.from("campaign_state").upsert(
    {
      campaign_id: campaignId,
      active_map_id: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "campaign_id" }
  );

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function deleteMap(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const mapId = formData.get("map_id") as string;

  const supabase = await requireMaster(campaignId);

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
