"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createToken(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const mapId = formData.get("map_id") as string;
  const label = formData.get("label") as string;
  const file = formData.get("file") as File | null;
  const hpMax = formData.get("hp_max") as string;
  const weaponName = formData.get("weapon_name") as string;
  const weaponDamage = formData.get("weapon_damage") as string;
  const loot = formData.get("loot") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  let imageUrl: string | null = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const path = `${campaignId}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("tokens")
      .upload(path, arrayBuffer, { contentType: file.type });
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("tokens").getPublicUrl(path);
      imageUrl = publicUrl;
    }
  }

  const hp = hpMax ? Number(hpMax) : null;

  await supabase.from("map_tokens").insert({
    campaign_id: campaignId,
    map_id: mapId,
    owner_user_id: null, // Meister-Pin (Monster/NSC), kein bestimmter Spieler
    label: label || "Pin",
    image_url: imageUrl,
    pos_x: 50,
    pos_y: 50,
    placed: true,
    hp_current: hp,
    hp_max: hp,
    details: {
      weapon: weaponName ? { name: weaponName, damage: weaponDamage } : null,
      loot: loot || null,
    },
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}

export async function deleteToken(formData: FormData) {
  const campaignId = formData.get("campaign_id") as string;
  const tokenId = formData.get("token_id") as string;

  const supabase = await createClient();
  await supabase.from("map_tokens").delete().eq("id", tokenId);

  revalidatePath(`/dashboard/campaigns/${campaignId}/play`);
}
