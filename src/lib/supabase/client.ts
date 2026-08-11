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

// WICHTIG: Die Echtzeit-Verbindung (Realtime) bekommt die Anmeldung nicht
// automatisch mit - ohne das hier bleiben Sicherheitsregeln (RLS) für
// Live-Updates blockiert, auch wenn ganz normale Anfragen funktionieren.
// Deswegen vor JEDEM Realtime-Abo den Zugangstoken explizit mitgeben.
export async function createAuthedRealtimeClient() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    supabase.realtime.setAuth(session.access_token);
  }
  return supabase;
}
