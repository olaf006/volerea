"use client";

// Würfel-Buttons. Jeder Klick würfelt sofort und wird über die
// Datenbank an alle live weitergegeben (siehe LiveDiceFeed).

import { useTransition } from "react";
import { rollDice } from "@/app/session-actions";

const DICE = ["W4", "W6", "W8", "W10", "W12", "W20", "W100"];

export default function DiceRoller({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();

  function roll(dice: string) {
    const formData = new FormData();
    formData.set("campaign_id", campaignId);
    formData.set("dice", dice);
    startTransition(() => {
      rollDice(formData);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DICE.map((d) => (
        <button
          key={d}
          onClick={() => roll(d)}
          disabled={isPending}
          className="rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 px-4 py-3 text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
