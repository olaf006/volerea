"use client";

// Inventar-Verwaltung: Items hinzufügen/entfernen, Münzen anpassen.
// Traglast wird automatisch aus der Stärke berechnet (Stärke × 15 Pfund,
// nach offizieller Regel).

import { useMemo, useState } from "react";
import { updateInventory } from "@/app/characters-actions";
import { carryingCapacity, InventoryItem } from "@/lib/dnd-data";

export default function InventoryManager({
  characterId,
  campaignId,
  strength,
  initialInventory,
  initialCurrency,
}: {
  characterId: string;
  campaignId: string;
  strength: number;
  initialInventory: InventoryItem[];
  initialCurrency: { gold: number; silver: number; copper: number };
}) {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory ?? []);
  const [currency, setCurrency] = useState(
    initialCurrency ?? { gold: 0, silver: 0, copper: 0 }
  );
  const [newItem, setNewItem] = useState({ name: "", qty: 1, weight: 0 });

  const totalWeight = items.reduce((sum, i) => sum + i.qty * i.weight, 0);
  const capacity = useMemo(() => carryingCapacity(strength), [strength]);

  function addItem() {
    if (!newItem.name.trim()) return;
    setItems((prev) => [...prev, { ...newItem, name: newItem.name.trim() }]);
    setNewItem({ name: "", qty: 1, weight: 0 });
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={updateInventory} className="space-y-4">
      <input type="hidden" name="character_id" value={characterId} />
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input type="hidden" name="inventory_json" value={JSON.stringify(items)} />
      <input
        type="hidden"
        name="currency_json"
        value={JSON.stringify(currency)}
      />

      {/* Münzen */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Gold (GS)</label>
          <input
            type="number"
            value={currency.gold}
            onChange={(e) =>
              setCurrency((c) => ({ ...c, gold: Number(e.target.value) }))
            }
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Silber (SS)</label>
          <input
            type="number"
            value={currency.silver}
            onChange={(e) =>
              setCurrency((c) => ({ ...c, silver: Number(e.target.value) }))
            }
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Kupfer (KS)</label>
          <input
            type="number"
            value={currency.copper}
            onChange={(e) =>
              setCurrency((c) => ({ ...c, copper: Number(e.target.value) }))
            }
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
      </div>

      {/* Gegenstände */}
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-sm border-b border-zinc-800 py-1.5"
          >
            <span className="text-zinc-200">
              {item.qty > 1 ? `${item.qty}× ` : ""}
              {item.name}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-zinc-500">{item.qty * item.weight} lb</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Entfernen
              </button>
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-zinc-500 text-sm">Noch keine Gegenstände.</p>
        )}
      </div>

      {/* Neuen Gegenstand hinzufügen */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Name</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))}
            placeholder="z.B. Heiltrank"
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
        <div className="w-20">
          <label className="block text-xs text-zinc-500 mb-1">Anzahl</label>
          <input
            type="number"
            min={1}
            value={newItem.qty}
            onChange={(e) =>
              setNewItem((n) => ({ ...n, qty: Number(e.target.value) }))
            }
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs text-zinc-500 mb-1">Gewicht (lb)</label>
          <input
            type="number"
            min={0}
            value={newItem.weight}
            onChange={(e) =>
              setNewItem((n) => ({ ...n, weight: Number(e.target.value) }))
            }
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-md border border-zinc-700 text-zinc-200 px-4 py-2 hover:bg-zinc-800 transition text-sm"
        >
          Hinzufügen
        </button>
      </div>

      <div
        className={`text-sm ${
          totalWeight > capacity ? "text-red-400" : "text-zinc-400"
        }`}
      >
        Gesamtgewicht: {totalWeight} / {capacity} lb Traglast
        {totalWeight > capacity && " – überladen!"}
      </div>

      <button
        type="submit"
        className="rounded-md bg-zinc-100 text-zinc-900 font-medium px-4 py-2 hover:bg-white transition text-sm"
      >
        Inventar speichern
      </button>
    </form>
  );
}
