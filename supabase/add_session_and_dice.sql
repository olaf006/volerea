-- Sitzungs-Status: hält fest, ob der Meister die Kampagne "gestartet" hat.
-- Solange nicht gestartet, sehen Spieler eine Lobby statt des Live-Bildschirms.
alter table campaign_state add column if not exists session_active boolean not null default false;

-- Würfelwürfe: jeder Wurf wird gespeichert, damit der Meister (und alle
-- anderen) live mitverfolgen können, wer was gewürfelt hat.
create table if not exists dice_rolls (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  dice text not null,        -- z.B. "W20"
  result int not null,
  created_at timestamptz not null default now()
);

alter table dice_rolls enable row level security;

create policy "dice_rolls_select_campaign_members" on dice_rolls for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);
create policy "dice_rolls_insert_own" on dice_rolls for insert with check (user_id = auth.uid());

alter publication supabase_realtime add table dice_rolls;
