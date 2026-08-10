"use server";

// Server Actions rund um Gruppen: erstellen und über den Einladungscode beitreten.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const name = formData.get("name") as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  // Der Ersteller wird automatisch als Meister eingetragen
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "master",
  });

  if (memberError) {
    redirect(`/dashboard?error=${encodeURIComponent(memberError.message)}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/groups/${group.id}`);
}

export async function joinGroup(formData: FormData) {
  const inviteCode = (formData.get("invite_code") as string)?.trim();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: group, error } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (error || !group) {
    redirect(`/dashboard?error=${encodeURIComponent("Kein Gruppe mit diesem Code gefunden.")}`);
  }

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group!.id,
    user_id: user.id,
    role: "player",
  });

  if (memberError) {
    // Falls schon Mitglied (primary key conflict), einfach zur Gruppe weiterleiten
    redirect(`/dashboard/groups/${group!.id}`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/groups/${group!.id}`);
}
