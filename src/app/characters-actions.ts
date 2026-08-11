"use server";

// Server Actions rund um Charaktere: erstellen, Inventar bearbeiten, löschen.
// Jede Aktion prüft serverseitig Besitz bzw. Meister-Rolle - das darf sich
// nicht nur auf die Oberfläche verlassen.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { levelForXp } from "@/lib/dnd-data";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function isMasterOfCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignId: string,
  userId: string
) {
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("group_id")
    .eq("id", campaignId)
    .single();

  if (!campaign) return false;

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", campaign.group_id)
    .eq("user_id", userId)
    .maybeSingle();

  return membership?.role === "master";
}

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
  const tokenImageFile = formData.get("token_image") as File | null;

  // Fertigkeiten, Ausrüstung und Zauber kommen als JSON aus dem Formular
  let extraDetails: Record<string, unknown> = {};
  try {
    extraDetails = JSON.parse((formData.get("details_json") as string) ?? "{}");
  } catch {
    extraDetails = {};
  }

  const { supabase, user } = await getCurrentUser();

  let tokenImageUrl: string | null = null;
  if (tokenImageFile && tokenImageFile.size > 0) {
    const fileExt = tokenImageFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await tokenImageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("tokens")
      .upload(path, arrayBuffer, { contentType: tokenImageFile.type });
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("tokens").getPublicUrl(path);
      tokenImageUrl = publicUrl;
    }
  }

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
    details: { backgroundStory, tokenImage: tokenImageUrl, ...extraDetails },
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

  const { supabase, user } = await getCurrentUser();

  const { data: character } = await supabase
    .from("characters")
    .select("details, user_id")
    .eq("id", characterId)
    .single();

  if (!character) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        "Charakter nicht gefunden."
      )}`
    );
  }

  // NUR der Besitzer des Charakters darf sein Inventar bearbeiten
  if (character!.user_id !== user.id) {
    redirect(
      `/dashboard/campaigns/${campaignId}/character/${characterId}?error=${encodeURIComponent(
        "Nur der Spieler dieses Charakters darf das Inventar bearbeiten."
      )}`
    );
  }

  const currentDetails = (character!.details as Record<string, unknown>) ?? {};

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

export async function levelUpCharacter(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const campaignId = formData.get("campaign_id") as string;
  const newLevel = Number(formData.get("new_level"));
  const hpGain = Number(formData.get("hp_gain"));
  const newProficiencyBonus = Number(formData.get("proficiency_bonus"));

  const abilitiesJson = formData.get("abilities_json") as string;
  const detailsJson = formData.get("details_json") as string;

  const { supabase, user } = await getCurrentUser();

  const { data: character } = await supabase
    .from("characters")
    .select("user_id, hp_max, hp_current, details")
    .eq("id", characterId)
    .single();

  if (!character) return;

  const isOwner = character.user_id === user.id;
  const isMaster = isOwner ? true : await isMasterOfCampaign(supabase, campaignId, user.id);
  if (!isOwner && !isMaster) return;

  let abilities: Record<string, number> = {};
  try {
    abilities = JSON.parse(abilitiesJson || "{}");
  } catch {
    abilities = {};
  }

  let newDetails: Record<string, unknown> = {};
  try {
    newDetails = JSON.parse(detailsJson || "{}");
  } catch {
    newDetails = {};
  }

  const currentDetails = (character.details as Record<string, unknown>) ?? {};

  await supabase
    .from("characters")
    .update({
      level: newLevel,
      hp_max: character.hp_max + hpGain,
      hp_current: character.hp_current + hpGain,
      ...abilities,
      details: {
        ...currentDetails,
        ...newDetails,
        proficiencyBonus: newProficiencyBonus,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", characterId);

  revalidatePath(`/dashboard/campaigns/${campaignId}/character/${characterId}`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

// Meister vergibt XP an einen Charakter. Wird dadurch die Schwelle zur
// nächsten Stufe überschritten, entsteht automatisch ein Level-Up-
// Ereignis - das löst die große Ankündigung für alle und das
// Auswahl-Pop-up beim betroffenen Spieler aus, ganz ohne Klick.
export async function addXp(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const campaignId = formData.get("campaign_id") as string;
  const amount = Number(formData.get("amount"));

  const { supabase, user } = await getCurrentUser();

  const isMaster = await isMasterOfCampaign(supabase, campaignId, user.id);
  if (!isMaster) return;

  const { data: character } = await supabase
    .from("characters")
    .select("xp, level, name, user_id")
    .eq("id", characterId)
    .single();

  if (!character) return;

  const newXp = character.xp + amount;
  const pendingLevel = levelForXp(newXp);

  await supabase.from("characters").update({ xp: newXp }).eq("id", characterId);

  if (pendingLevel > character.level) {
    await supabase.from("level_up_events").insert({
      campaign_id: campaignId,
      character_id: characterId,
      character_name: character.name,
      owner_user_id: character.user_id,
      new_level: character.level + 1,
    });
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

// Trefferwürfel für den Stufenaufstieg würfeln - serverseitig, damit
// nicht am Ergebnis manipuliert werden kann.
export async function rollHitDie(sides: number): Promise<number> {
  return Math.floor(Math.random() * sides) + 1;
}

export async function deleteCharacter(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const campaignId = formData.get("campaign_id") as string;

  const { supabase, user } = await getCurrentUser();

  const { data: character } = await supabase
    .from("characters")
    .select("user_id")
    .eq("id", characterId)
    .single();

  if (!character) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        "Charakter nicht gefunden."
      )}`
    );
  }

  const isOwner = character!.user_id === user.id;
  const isMaster = isOwner ? true : await isMasterOfCampaign(supabase, campaignId, user.id);

  if (!isOwner && !isMaster) {
    redirect(
      `/dashboard/campaigns/${campaignId}?error=${encodeURIComponent(
        "Nur der Besitzer oder der Meister darf diesen Charakter löschen."
      )}`
    );
  }

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
