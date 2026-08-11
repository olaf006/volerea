import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import InventoryManager from "@/components/InventoryManager";
import HpEditor from "@/components/HpEditor";
import LevelUpWatcher from "@/components/LevelUpWatcher";
import { abilityModifier, InventoryItem, xpForNextLevel } from "@/lib/dnd-data";

const ABILITY_LABELS: { key: string; label: string }[] = [
  { key: "strength", label: "Stärke" },
  { key: "dexterity", label: "Geschicklichkeit" },
  { key: "constitution", label: "Konstitution" },
  { key: "intelligence", label: "Intelligenz" },
  { key: "wisdom", label: "Weisheit" },
  { key: "charisma", label: "Charisma" },
];

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id, characterId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: character } = await supabase
    .from("characters")
    .select(
      "id, name, race, class, level, xp, strength, dexterity, constitution, intelligence, wisdom, charisma, hp_current, hp_max, armor_class, details, user_id, campaign_id"
    )
    .eq("id", characterId)
    .single();

  if (!character || character.campaign_id !== id) notFound();

  const isOwner = character.user_id === user.id;

  // Nur der Besitzer oder der Meister der Gruppe darf das Charakterblatt
  // im Detail sehen - andere Spieler nicht, auch nicht über direkten Link.
  if (!isOwner) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("group_id")
      .eq("id", id)
      .single();

    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", campaign?.group_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.role !== "master") {
      redirect(
        `/dashboard/campaigns/${id}?error=${encodeURIComponent(
          "Du darfst nur dein eigenes Charakterblatt öffnen."
        )}`
      );
    }
  }

  const details = (character.details ?? {}) as Record<string, unknown>;
  const inventory = (details.inventory as InventoryItem[]) ?? [];
  const currency = (details.currency as {
    gold: number;
    silver: number;
    copper: number;
  }) ?? { gold: 0, silver: 0, copper: 0 };

  return (
    <div className="min-h-screen bg-tavern-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="text-zinc-400 text-sm hover:text-zinc-200"
        >
          ← Zurück zur Kampagne
        </Link>

        <div className="flex items-center gap-3 mt-2 mb-6">
          <h1 className="text-2xl font-semibold text-amber-100">
            {character.name}
          </h1>
          <span className="text-sm text-zinc-500">
            {character.race} {character.class}, Stufe {character.level}
          </span>
        </div>

        {isOwner && <LevelUpWatcher campaignId={id} characterId={character.id} />}

        <div className="rounded-lg border border-tavern-800 bg-tavern-900 p-4 mb-6">
          <span className="text-xs text-zinc-500 block">Erfahrungspunkte</span>
          <span className="text-zinc-100 font-medium">
            {character.xp}
            {xpForNextLevel(character.level) !== null &&
              ` / ${xpForNextLevel(character.level)} für Stufe ${character.level + 1}`}
          </span>
          <p className="text-xs text-zinc-500 mt-1">
            Der Meister vergibt XP - sobald genug da sind, poppt automatisch
            die Auswahl für die neue Stufe auf.
          </p>
        </div>

        {/* Kampfwerte */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
              <span className="text-xs text-zinc-500 block mb-1">Lebenspunkte</span>
              <HpEditor
                characterId={character.id}
                campaignId={id}
                hpCurrent={character.hp_current}
                hpMax={character.hp_max}
              />
            </div>
            <div className="rounded-md bg-tavern-950 border border-tavern-800 px-4 py-3">
              <span className="text-xs text-zinc-500 block">
                Rüstungsklasse
              </span>
              <span className="text-xl text-zinc-100 font-medium">
                {character.armor_class}
              </span>
            </div>
          </div>
        </div>

        {/* Attribute */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6">
          <h2 className="text-lg font-medium text-amber-100 mb-3">Attribute</h2>
          <div className="grid grid-cols-3 gap-2">
            {ABILITY_LABELS.map(({ key, label }) => {
              const score = Number(
                character[key as keyof typeof character]
              );
              const mod = abilityModifier(score);
              return (
                <div
                  key={key}
                  className="rounded-md bg-tavern-950 border border-tavern-800 px-3 py-2 text-center"
                >
                  <span className="text-xs text-zinc-500 block">{label}</span>
                  <span className="text-zinc-100 font-medium">
                    {score} ({mod >= 0 ? "+" : ""}
                    {mod})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hintergrund & Talent */}
        {Boolean(details.background || details.originFeat) && (
          <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20 mb-6 space-y-1 text-sm">
            <h2 className="text-lg font-medium text-amber-100 mb-2">
              Hintergrund
            </h2>
            {typeof details.background === "string" && (
              <p className="text-zinc-300">{details.background}</p>
            )}
            {typeof details.originFeat === "string" && (
              <p className="text-zinc-400">
                <span className="text-zinc-500">Ursprungstalent: </span>
                {details.originFeat}
              </p>
            )}
            {Array.isArray(details.skills) && (
              <p className="text-zinc-400">
                <span className="text-zinc-500">Fertigkeiten: </span>
                {(details.skills as string[]).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Inventar */}
        <div className="rounded-2xl border border-tavern-800 bg-tavern-900/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-medium text-amber-100 mb-1">Inventar</h2>
          <p className="text-xs text-zinc-500 mb-4">
            {isOwner
              ? "Verwalte deine Gegenstände und Münzen."
              : "Nur der Spieler dieses Charakters kann das Inventar bearbeiten."}
          </p>

          {isOwner ? (
            <InventoryManager
              characterId={character.id}
              campaignId={id}
              strength={character.strength}
              initialInventory={inventory}
              initialCurrency={currency}
            />
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-zinc-300 mb-2">
                {currency.gold} GS, {currency.silver} SS, {currency.copper} KS
              </p>
              {inventory.map((item, idx) => (
                <div key={idx} className="text-sm text-zinc-300">
                  {item.qty > 1 ? `${item.qty}× ` : ""}
                  {item.name}
                  {item.damage && (
                    <span className="text-zinc-500"> ({item.damage})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
