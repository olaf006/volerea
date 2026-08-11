import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tavern-950 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 35%, rgba(217,155,63,0.12), transparent 70%)",
        }}
      />
      <div className="text-center max-w-md relative">
        <p className="text-3xl mb-2">🎲</p>
        <h1 className="text-5xl font-semibold text-amber-100 mb-3 tracking-tight">
          Volerea
        </h1>
        <p className="text-zinc-400 mb-10 text-lg">
          Euer digitaler Spieltisch: Charakterblätter, Karten und Notizen an
          einem Ort, live für dich und deine Gruppe.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-amber-500 text-tavern-950 font-medium px-6 py-2.5 hover:bg-amber-400 transition shadow-lg shadow-amber-950/40"
          >
            Anmelden
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-tavern-700 text-zinc-200 font-medium px-6 py-2.5 hover:bg-tavern-900 transition"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
