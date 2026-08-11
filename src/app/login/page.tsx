import { login } from "@/app/auth-actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-tavern-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-tavern-800 bg-tavern-900/60 p-8 shadow-2xl shadow-black/40">
        <p className="text-2xl mb-1">🎲</p>
        <h1 className="text-2xl font-semibold text-amber-100 mb-1">Volerea</h1>
        <p className="text-zinc-400 mb-8">Melde dich an, um weiterzuspielen.</p>

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">E-Mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md bg-tavern-900 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Passwort</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md bg-tavern-900 border border-tavern-700 px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 text-tavern-950 font-medium py-2 hover:bg-amber-400 transition"
          >
            Anmelden
          </button>
        </form>

        <p className="text-zinc-400 text-sm mt-6">
          Noch keinen Account?{" "}
          <Link href="/signup" className="text-zinc-100 underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
