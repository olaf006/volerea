"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireMaster(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

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

  if (membership?.role !== "master") return null;
  return supabase;
}

// Startet einen Kampf: würfelt Initiative (1W20) für jeden aktuell
// platzierten Pin auf der Karte und sortiert absteigend.
export async function startCombat(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const mapId = formData.get("map_id") as string;

  const supabase = await requireMaster(campaignId);
  if (!supabase) return;

  const { data: tokens } = await supabase
    .from("map_tokens")
    .select("id, label, owner_user_id")
    .eq("map_id", mapId)
    .eq("placed", true);

  const turnOrder = (tokens ?? [])
    .map((t) => ({
      tokenId: t.id,
      label: t.label,
      isPlayer: t.owner_user_id !== null,
      initiative: Math.floor(Math.random() * 20) + 1,
    }))
    .sort((a, b) => b.initiative - a.initiative);

  await supabase.from("combat_state").upsert(
    {
      campaign_id: campaignId,
      turn_order: turnOrder,
      current_index: 0,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "campaign_id" }
  );

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

export async function nextTurn(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const supabase = await requireMaster(campaignId);
  if (!supabase) return;

  const { data: state } = await supabase
    .from("combat_state")
    .select("turn_order, current_index")
    .eq("campaign_id", campaignId)
    .single();

  if (!state) return;
  const order = state.turn_order as unknown[];
  const nextIndex = (state.current_index + 1) % Math.max(1, order.length);

  await supabase
    .from("combat_state")
    .update({ current_index: nextIndex, updated_at: new Date().toISOString() })
    .eq("campaign_id", campaignId);

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

export async function endCombat(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const supabase = await requireMaster(campaignId);
  if (!supabase) return;

  await supabase
    .from("combat_state")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("campaign_id", campaignId);

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

// HP eines Meister-Pins (Monster/NSC) direkt am Token speichern
export async function updateTokenHp(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const tokenId = formData.get("token_id") as string;
  const hpCurrent = Number(formData.get("hp_current"));
  const hpMax = Number(formData.get("hp_max"));

  const supabase = await requireMaster(campaignId);
  if (!supabase) return;

  await supabase
    .from("map_tokens")
    .update({ hp_current: hpCurrent, hp_max: hpMax })
    .eq("id", tokenId);
}

// Angriff: Ziel + Waffe wurden vom Spieler gewählt, der Schaden wird
// SERVERSEITIG gewürfelt (nicht vom Client vorgegeben) und automatisch
// beim Ziel abgezogen.
export async function resolveAttack(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const targetTokenId = formData.get("target_token_id") as string;
  const targetLabel = formData.get("target_label") as string;
  const diceNotation = formData.get("dice_notation") as string; // z.B. "1W6"
  const weaponLabel = formData.get("weapon_label") as string;

  const match = diceNotation.match(/(\d+)\s*W\s*(\d+)/i);
  if (!match) return;
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);

  let damage = 0;
  for (let i = 0; i < count; i++) {
    damage += Math.floor(Math.random() * sides) + 1;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("apply_damage", { token_id: targetTokenId, amount: damage });

  await supabase.from("dice_rolls").insert({
    campaign_id: campaignId,
    user_id: user.id,
    dice: `${weaponLabel} → ${targetLabel}`,
    result: damage,
  });
}

// Meister greift mit einem NPC einen Spieler an: gleiche Logik wie beim
// Spieler-Angriff, nur umgekehrt - Schaden geht vom Charakter-HP ab.
export async function resolveMasterAttack(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const attackerLabel = formData.get("attacker_label") as string;
  const diceNotation = formData.get("dice_notation") as string;
  const targetCharacterId = formData.get("target_character_id") as string;
  const targetLabel = formData.get("target_label") as string;

  const match = diceNotation.match(/(\d+)\s*W\s*(\d+)/i);
  if (!match) return;
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);

  let damage = 0;
  for (let i = 0; i < count; i++) {
    damage += Math.floor(Math.random() * sides) + 1;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("apply_damage_to_character", {
    char_id: targetCharacterId,
    amount: damage,
  });

  await supabase.from("dice_rolls").insert({
    campaign_id: campaignId,
    user_id: user.id,
    dice: `${attackerLabel} → ${targetLabel}`,
    result: damage,
  });
}

// HP eines Spieler-Charakters anpassen - Besitzer selbst oder der Meister
export async function updateCharacterHp(formData: FormData) {
  const characterId = formData.get("character_id") as string;
  const hpCurrent = Number(formData.get("hp_current"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: character } = await supabase
    .from("characters")
    .select("user_id, campaign_id")
    .eq("id", characterId)
    .single();
  if (!character) return;

  let allowed = character.user_id === user.id;
  if (!allowed) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("group_id")
      .eq("id", character.campaign_id)
      .single();
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", campaign?.group_id)
      .eq("user_id", user.id)
      .maybeSingle();
    allowed = membership?.role === "master";
  }
  if (!allowed) return;

  await supabase
    .from("characters")
    .update({ hp_current: hpCurrent })
    .eq("id", characterId);
}
