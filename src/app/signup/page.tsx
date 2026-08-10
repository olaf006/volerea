import { signup } from "@/app/auth-actions";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Volerea</h1>
        <p className="text-zinc-400 mb-8">Erstelle deinen Account.</p>

        <form action={signup} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Spielername
            </label>
            <input
              type="text"
              name="username"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">E-Mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Passwort</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-100 text-zinc-900 font-medium py-2 hover:bg-white transition"
          >
            Registrieren
          </button>
        </form>

        <p className="text-zinc-400 text-sm mt-6">
          Schon einen Account?{" "}
          <Link href="/login" className="text-zinc-100 underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
