"use client";

// Würfel-Buttons. Jeder Klick würfelt sofort (kurze "Rollt..."-Animation
// zur Rückmeldung) und wird über die Datenbank an alle live weitergegeben
// (siehe LiveDiceFeed).

import { useRef, useState, useTransition } from "react";
import { rollDice } from "@/app/session-actions";

const DICE = ["W4", "W6", "W8", "W10", "W12", "W20", "W100"];

export default function DiceRoller({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();
  const [rollingDie, setRollingDie] = useState<string | null>(null);
  const [flashNumber, setFlashNumber] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function roll(dice: string) {
    const sides = Number(dice.replace("W", ""));
    setRollingDie(dice);

    // Kurze visuelle Animation: Zahlen flackern, bevor das echte Ergebnis
    // über den Live-Feed ankommt
    intervalRef.current = setInterval(() => {
      setFlashNumber(Math.floor(Math.random() * sides) + 1);
    }, 60);

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRollingDie(null);
      setFlashNumber(null);
    }, 500);

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
          className="relative rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 px-4 py-3 text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50 overflow-hidden"
        >
          {rollingDie === d ? (
            <span className="text-emerald-400 tabular-nums">
              {flashNumber ?? "…"}
            </span>
          ) : (
            d
          )}
        </button>
      ))}
    </div>
  );
}
