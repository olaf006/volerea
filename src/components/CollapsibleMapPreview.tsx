"use client";

import { useEffect, useState } from "react";

export default function CollapsibleMapPreview({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("volerea_map_preview_visible");
    if (saved === "false") setVisible(false);
  }, []);

  function toggle() {
    setVisible((v) => {
      localStorage.setItem("volerea_map_preview_visible", String(!v));
      return !v;
    });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-zinc-100">Aktive Karte</h2>
        <button
          onClick={toggle}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          {visible ? "Ausblenden" : "Einblenden"}
        </button>
      </div>
      {visible && children}
    </div>
  );
}
