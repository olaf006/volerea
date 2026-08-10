"use client";

// Formular zum Hochladen einer neuen Karte. Als Client Component, damit
// wir nach dem Absenden das Dateifeld leeren und einen Ladezustand zeigen
// können (Bild-Uploads können ein paar Sekunden dauern).

import { useRef, useState } from "react";
import { uploadMap } from "@/app/maps-actions";

export default function MapUploadForm({ campaignId }: { campaignId: string }) {
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={uploadMap}
      onSubmit={() => setUploading(true)}
      className="flex flex-col sm:flex-row gap-2"
    >
      <input type="hidden" name="campaign_id" value={campaignId} />
      <input
        type="text"
        name="name"
        placeholder="Kartenname (z.B. Marktplatz)"
        className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
      />
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="flex-1 rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-100 text-sm file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200 file:px-2 file:py-1"
      />
      <button
        type="submit"
        disabled={uploading}
        className="rounded-md bg-zinc-100 text-zinc-900 font-medium px-4 py-2 hover:bg-white transition text-sm disabled:opacity-50"
      >
        {uploading ? "Lädt hoch…" : "Hochladen"}
      </button>
    </form>
  );
}
