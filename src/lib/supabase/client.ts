// Supabase-Client für den Browser (Client Components)
// Wird überall dort benutzt, wo Nutzer live interagieren:
// z.B. Notizen tippen, Karten anklicken, Würfeln.
//
// WICHTIG: Immer dieselbe Verbindung wiederverwenden (Singleton), statt
// bei jedem Aufruf eine neue aufzubauen. Viele parallele Verbindungen
// von derselben Seite führten zu genau der Art "geht manchmal, geht
// manchmal nicht"-Unzuverlässigkeit bei Live-Updates.

import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient>;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

// Die Echtzeit-Verbindung (Realtime) bekommt die Anmeldung nicht
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
