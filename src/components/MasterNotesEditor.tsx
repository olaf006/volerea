"use client";

// Kategorisierte Notizen: links eine Liste von "Ordnern" (z.B. "Dorf",
// "NSC XYZ"), rechts der Inhalt der ausgewählten Kategorie. Speichert
// ohne Seitenwechsel, funktioniert vor und während der Sitzung gleich.

import { useState, useTransition } from "react";
import { updateMasterNotes } from "@/app/master-notes-actions";

interface Category {
  id: string;
  title: string;
  content: string;
}

export default function MasterNotesEditor({
  campaignId,
  initialCategories,
}: {
  campaignId: string;
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0
      ? initialCategories
      : [{ id: crypto.randomUUID(), title: "Allgemein", content: "" }]
  );
  const [selectedId, setSelectedId] = useState(categories[0]?.id);
  const [isPending, startTransition] = useTransition();

  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  function save(next: Category[]) {
    setCategories(next);
    const formData = new FormData();
    formData.set("campaign_id", campaignId);
    formData.set("categories_json", JSON.stringify(next));
    startTransition(() => {
      updateMasterNotes(formData);
    });
  }

  function addCategory() {
    const title = prompt("Name der neuen Kategorie (z.B. 'Dorf Rieselfeld')");
    if (!title) return;
    const newCat = { id: crypto.randomUUID(), title, content: "" };
    const next = [...categories, newCat];
    setSelectedId(newCat.id);
    save(next);
  }

  function deleteCategory(id: string) {
    if (categories.length <= 1) return; // mindestens eine Kategorie behalten
    if (!confirm("Diese Kategorie wirklich löschen?")) return;
    const next = categories.filter((c) => c.id !== id);
    setSelectedId(next[0].id);
    save(next);
  }

  function updateContent(content: string) {
    const next = categories.map((c) =>
      c.id === selected.id ? { ...c, content } : c
    );
    setCategories(next); // lokal sofort, Speichern erst auf Klick
  }

  function renameCategory(title: string) {
    const next = categories.map((c) =>
      c.id === selected.id ? { ...c, title } : c
    );
    setCategories(next);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex gap-1 flex-wrap mb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`text-xs rounded-md px-2 py-1 border ${
              c.id === selected.id
                ? "border-zinc-300 bg-zinc-800 text-zinc-100"
                : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
            }`}
          >
            {c.title}
          </button>
        ))}
        <button
          onClick={addCategory}
          className="text-xs rounded-md px-2 py-1 border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300"
        >
          + Ordner
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <input
          value={selected.title}
          onChange={(e) => renameCategory(e.target.value)}
          className="flex-1 text-sm bg-transparent border-b border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500 pb-1"
        />
        {categories.length > 1 && (
          <button
            onClick={() => deleteCategory(selected.id)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Löschen
          </button>
        )}
      </div>

      <textarea
        value={selected.content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="Notizen zu dieser Kategorie..."
        className="flex-1 w-full min-h-[120px] rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 text-sm resize-none focus:outline-none focus:border-zinc-400"
      />

      <button
        onClick={() => save(categories)}
        disabled={isPending}
        className="mt-2 rounded-md border border-zinc-700 text-zinc-200 px-3 py-1.5 hover:bg-zinc-800 transition text-xs disabled:opacity-50"
      >
        {isPending ? "Speichert…" : "Speichern"}
      </button>
    </div>
  );
}
