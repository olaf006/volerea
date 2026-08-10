"use server";

// Server Action zum Erstellen eines Charakters durch einen Spieler.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCharacter(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const name = formData.get("name") as string;
  const race = formData.get("race") as string;
  const charClass = formData.get("class") as string;

  const strength = Number(formData.get("strength"));
  const dexterity = Number(formData.get("dexterity"));
  const constitution = Number(formData.get("constitution"));
  const intelligence = Number(formData.get("intelligence"));
  const wisdom = Number(formData.get("wisdom"));
  const charisma = Number(formData.get("charisma"));

  // HP und Rüstungsklasse werden im Formular automatisch berechnet
  const hpMax = Number(formData.get("hp_max"));
  const armorClass = Number(formData.get("armor_class"));

  const backgroundStory = formData.get("background_story") as string;

  // Fertigkeiten, Ausrüstung und Zauber kommen als JSON aus dem Formular
  let extraDetails: Record<string, unknown> = {};
  try {
    extraDetails = JSON.parse((formData.get("details_json") as string) ?? "{}");
  } catch {
    extraDetails = {};
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase.from("characters").insert({
    campaign_id: campaignId,
    user_id: user.id,
    name,
    race,
    class: charClass,
    level: 1,
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
    hp_current: hpMax,
    hp_max: hpMax,
    armor_class: armorClass,
    details: { backgroundStory, ...extraDetails },
  });

  if (error) {
    redirect(
      `/dashboard/campaigns/${campaignId}/character/new?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function updateInventory(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const campaignId = formData.get("campaign_id") as string;
  const inventoryJson = formData.get("inventory_json") as string;
  const currencyJson = formData.get("currency_json") as string;

  const supabase = await createClient();

  const { data: character } = await supabase
    .from("characters")
    .select("details")
    .eq("id", characterId)
    .single();

  const currentDetails = (character?.details as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("characters")
    .update({
      details: {
        ...currentDetails,
        inventory: JSON.parse(inventoryJson),
        currency: JSON.parse(currencyJson),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", characterId);

  if (error) {
    redirect(
      `/dashboard/campaigns/${campaignId}/character/${characterId}?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(
    `/dashboard/campaigns/${campaignId}/character/${characterId}`
  );
  redirect(`/dashboard/campaigns/${campaignId}/character/${characterId}`);
}

export async function deleteCharacter(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const campaignId = formData.get("campaign_id") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", characterId);

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
