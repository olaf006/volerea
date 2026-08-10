// Supabase-Client für den Server (Server Components, Route Handlers)
// Wird benutzt, wenn wir vor dem Ausliefern der Seite schon wissen müssen,
// wer eingeloggt ist (z.B. um zu prüfen, ob jemand Zugriff auf eine Kampagne hat).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll wurde von einer Server Component aufgerufen.
            // Das kann ignoriert werden, wenn Middleware die Session refresht.
          }
        },
      },
    }
  );
}
