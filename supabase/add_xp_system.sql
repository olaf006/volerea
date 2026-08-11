-- XP-Wert am Charakter
alter table characters add column if not exists xp int not null default 0;

-- Level-Up-Ereignisse: werden angelegt, sobald ein Charakter durch XP
-- genug für die nächste Stufe hat. Dient der großen Ankündigung für
-- alle und dem automatischen Auswahl-Pop-up beim betroffenen Spieler.
create table if not exists level_up_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  character_name text not null,
  owner_user_id uuid not null,
  new_level int not null,
  created_at timestamptz not null default now()
);

alter table level_up_events enable row level security;

create policy "levelup_select_campaign_members" on level_up_events for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);
create policy "levelup_insert_master" on level_up_events for insert with check (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

alter publication supabase_realtime add table level_up_events;
