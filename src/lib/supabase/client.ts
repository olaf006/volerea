// Supabase-Client für den Browser (Client Components)
// Wird überall dort benutzt, wo Nutzer live interagieren:
// z.B. Notizen tippen, Karten anklicken, Würfeln.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
