-- Initiative-Tracker: hält die Kampfreihenfolge pro Kampagne fest.
create table if not exists combat_state (
  campaign_id uuid primary key references campaigns(id) on delete cascade,
  turn_order jsonb not null default '[]'::jsonb,
  current_index int not null default 0,
  active boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table combat_state enable row level security;

create policy "combat_select_campaign_members" on combat_state for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);
create policy "combat_upsert_master" on combat_state for insert with check (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);
create policy "combat_update_master" on combat_state for update using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

alter publication supabase_realtime add table combat_state;

-- Lebenspunkte direkt am Pin: für Meister-Pins (Monster/NSCs) wird HP
-- hier gespeichert. Für Spieler-Pins verweist character_id auf den echten
-- Charakter, dessen Lebenspunkte in der characters-Tabelle die Quelle
-- der Wahrheit bleiben.
alter table map_tokens add column if not exists hp_current int;
alter table map_tokens add column if not exists hp_max int;
alter table map_tokens add column if not exists character_id uuid references characters(id) on delete set null;
