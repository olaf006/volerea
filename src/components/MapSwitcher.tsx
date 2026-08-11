// Kompakter Kartenwechsler für den Meister-Live-Bildschirm - kein
// Verlassen der Sitzung mehr nötig, um die Karte zu wechseln.

import { setActiveMap } from "@/app/maps-actions";

interface MapInfo {
  id: string;
  name: string;
}

export default function MapSwitcher({
  campaignId,
  maps,
  activeMapId,
}: {
  campaignId: string;
  maps: MapInfo[];
  activeMapId: string | null;
}) {
  if (maps.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Noch keine Karten hochgeladen (das geht auf der Kampagnen-Seite).
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {maps.map((m) => (
        <form key={m.id} action={setActiveMap}>
          <input type="hidden" name="campaign_id" value={campaignId} />
          <input type="hidden" name="map_id" value={m.id} />
          <button
            type="submit"
            disabled={activeMapId === m.id}
            className={`text-xs rounded-md px-3 py-1.5 border transition ${
              activeMapId === m.id
                ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {m.name}
          </button>
        </form>
      ))}
    </div>
  );
}
