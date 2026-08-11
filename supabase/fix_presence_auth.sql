-- Neuere Supabase-Projekte verlangen für Presence/Broadcast (Online-
-- Status u.ä.) eine explizite Freigabe über Sicherheitsregeln, ähnlich
-- wie bei normalen Tabellen. Ohne das bleibt "wer ist online" leer,
-- ganz ohne sichtbaren Fehler - genau das, was passiert ist.
create policy "presence_select_authenticated" on realtime.messages
  for select to authenticated using (extension = 'presence');

create policy "presence_insert_authenticated" on realtime.messages
  for insert to authenticated with check (extension = 'presence');
