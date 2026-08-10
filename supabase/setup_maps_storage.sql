-- Speicherort für Kartenbilder anlegen ("maps" Bucket).
-- public = true bedeutet: wer den Link kennt, kann das Bild sehen (kein
-- öffentliches Auflisten). Das reicht für eine private Spielgruppe locker.
insert into storage.buckets (id, name, public)
values ('maps', 'maps', true)
on conflict (id) do nothing;

-- Angemeldete Nutzer dürfen Bilder hochladen
create policy "maps_bucket_insert_authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'maps');

-- Jeder darf die Bilder sehen (nötig, damit die Karten im Browser laden)
create policy "maps_bucket_select_public" on storage.objects
  for select using (bucket_id = 'maps');

-- Nur der Hochlader darf sein eigenes Bild wieder löschen
create policy "maps_bucket_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'maps' and owner = auth.uid());
