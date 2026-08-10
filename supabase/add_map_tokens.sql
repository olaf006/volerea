-- Pins/Marker auf der Karte: Monster, NSCs oder Spieler-Charaktere,
-- die per Drag & Drop verschoben werden und live bei allen synchron sind.
create table if not exists map_tokens (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references maps(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  owner_user_id uuid references profiles(id) on delete cascade,
  label text not null,
  image_url text,
  pos_x numeric not null default 50,
  pos_y numeric not null default 50,
  created_at timestamptz not null default now()
);

alter table map_tokens enable row level security;

-- Alle Gruppenmitglieder sehen die Pins
create policy "tokens_select_campaign_members" on map_tokens for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);

-- Der Meister darf jeden Pin anlegen (Monster/NSCs), ein Spieler nur
-- seinen eigenen (owner_user_id = er selbst)
create policy "tokens_insert_master_or_own" on map_tokens for insert with check (
  owner_user_id = auth.uid()
  or exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

-- Verschieben: der Meister darf jeden Pin bewegen, ein Spieler nur seinen eigenen
create policy "tokens_update_master_or_own" on map_tokens for update using (
  owner_user_id = auth.uid()
  or exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

-- Löschen: der Meister darf jeden Pin entfernen, ein Spieler nur seinen eigenen
create policy "tokens_delete_master_or_own" on map_tokens for delete using (
  owner_user_id = auth.uid()
  or exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

alter publication supabase_realtime add table map_tokens;

-- Speicherort für optionale Pin-Bilder
insert into storage.buckets (id, name, public)
values ('tokens', 'tokens', true)
on conflict (id) do nothing;

create policy "tokens_bucket_insert_authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'tokens');

create policy "tokens_bucket_select_public" on storage.objects
  for select using (bucket_id = 'tokens');
