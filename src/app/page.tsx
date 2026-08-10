import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-semibold text-zinc-100 mb-3">Volerea</h1>
        <p className="text-zinc-400 mb-8">
          Euer digitaler Spieltisch: Charakterblätter, Karten und Notizen an
          einem Ort, live für dich und deine Gruppe.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-zinc-100 text-zinc-900 font-medium px-5 py-2 hover:bg-white transition"
          >
            Anmelden
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-zinc-700 text-zinc-200 font-medium px-5 py-2 hover:bg-zinc-900 transition"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
