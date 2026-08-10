-- ============================================================
-- VOLEREA – Datenbank-Schema
-- ============================================================
-- Diese Datei legt alle Tabellen an, die wir brauchen.
-- Du führst das gleich im Supabase-Dashboard unter "SQL Editor" aus.
--
-- Grundidee der Struktur:
--   profiles      -> ein Eintrag pro angemeldetem Nutzer
--   groups        -> deine Spielgruppe (z.B. "Freitagsrunde")
--   group_members -> wer gehört zu welcher Gruppe, als Meister oder Spieler
--   campaigns     -> eine Kampagne innerhalb einer Gruppe
--   characters    -> ein D&D-Charakterblatt pro Spieler pro Kampagne
--   maps          -> hochgeladene Karten für eine Kampagne
--   campaign_state-> merkt sich, welche Karte GERADE bei allen angezeigt wird
--   notes         -> Live-Notizen, die der Meister mitlesen kann
-- ============================================================

-- 1) PROFILES
-- Jeder Supabase-Nutzer (auth.users) bekommt automatisch ein Profil.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

-- Wenn sich jemand neu registriert, wird automatisch ein Profil angelegt.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- 2) GROUPS (Spielgruppen)
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles(id) on delete cascade,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now()
);

-- 3) GROUP_MEMBERS (wer ist Meister, wer ist Spieler)
create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('master', 'player')) default 'player',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- 4) CAMPAIGNS
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 5) CHARACTERS (D&D 5e Charakterblatt)
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  race text,
  class text,
  level int not null default 1,
  -- Die klassischen 6 D&D-Attribute
  strength int not null default 10,
  dexterity int not null default 10,
  constitution int not null default 10,
  intelligence int not null default 10,
  wisdom int not null default 10,
  charisma int not null default 10,
  -- Kampfwerte
  hp_current int not null default 10,
  hp_max int not null default 10,
  armor_class int not null default 10,
  -- Alles Weitere (Zauber, Ausrüstung, Fertigkeiten) als flexibles JSON,
  -- damit wir später nichts an der Tabelle ändern müssen.
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6) MAPS (Karten pro Kampagne)
create table if not exists maps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 7) CAMPAIGN_STATE (welche Karte wird GERADE live angezeigt)
-- Das ist der Kern des "Meister klickt Karte an -> alle sehen es sofort".
create table if not exists campaign_state (
  campaign_id uuid primary key references campaigns(id) on delete cascade,
  active_map_id uuid references maps(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 8) NOTES (Live-Notizen der Spieler, vom Meister live mitlesbar)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ohne das könnte jeder Nutzer die Daten aller anderen lesen/ändern.
-- Wir aktivieren RLS auf jeder Tabelle und erlauben Zugriff nur
-- Mitgliedern der jeweiligen Gruppe.
-- ============================================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table campaigns enable row level security;
alter table characters enable row level security;
alter table maps enable row level security;
alter table campaign_state enable row level security;
alter table notes enable row level security;

-- Hilfsfunktion: ist der aktuelle Nutzer Mitglied dieser Gruppe?
create or replace function is_group_member(target_group_id uuid)
returns boolean as $$
  select exists (
    select 1 from group_members
    where group_id = target_group_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Hilfsfunktion: ist der aktuelle Nutzer Meister dieser Gruppe?
create or replace function is_group_master(target_group_id uuid)
returns boolean as $$
  select exists (
    select 1 from group_members
    where group_id = target_group_id and user_id = auth.uid() and role = 'master'
  );
$$ language sql security definer stable;

-- profiles: jeder darf alle Profile lesen (für Namen-Anzeige), aber nur sich selbst ändern
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- groups: nur Mitglieder sehen ihre Gruppe; nur der Owner darf sie ändern/löschen
create policy "groups_select_members" on groups for select using (is_group_member(id));
create policy "groups_insert_own" on groups for insert with check (owner_id = auth.uid());
create policy "groups_update_owner" on groups for update using (owner_id = auth.uid());
create policy "groups_delete_owner" on groups for delete using (owner_id = auth.uid());

-- group_members: Mitglieder sehen die Mitgliederliste ihrer Gruppe
create policy "members_select_own_group" on group_members for select using (is_group_member(group_id));
create policy "members_insert_self" on group_members for insert with check (user_id = auth.uid());

-- campaigns: nur Gruppenmitglieder
create policy "campaigns_select_members" on campaigns for select using (is_group_member(group_id));
create policy "campaigns_insert_master" on campaigns for insert with check (is_group_master(group_id));
create policy "campaigns_update_master" on campaigns for update using (is_group_master(group_id));

-- characters: Spieler sehen/ändern ihren eigenen Charakter,
-- der Meister sieht alle Charaktere seiner Kampagnen
create policy "characters_select_own_or_master" on characters for select using (
  user_id = auth.uid()
  or exists (
    select 1 from campaigns c
    where c.id = campaign_id and is_group_master(c.group_id)
  )
);
create policy "characters_insert_own" on characters for insert with check (user_id = auth.uid());
create policy "characters_update_own_or_master" on characters for update using (
  user_id = auth.uid()
  or exists (
    select 1 from campaigns c
    where c.id = campaign_id and is_group_master(c.group_id)
  )
);

-- maps: alle Gruppenmitglieder der Kampagne sehen die Karten,
-- nur der Meister darf welche hochladen/ändern
create policy "maps_select_campaign_members" on maps for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);
create policy "maps_insert_master" on maps for insert with check (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

-- campaign_state: alle Mitglieder sehen, welche Karte aktiv ist;
-- nur der Meister darf sie ändern (das triggert die Live-Anzeige bei allen)
create policy "state_select_campaign_members" on campaign_state for select using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_member(c.group_id))
);
create policy "state_upsert_master" on campaign_state for insert with check (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);
create policy "state_update_master" on campaign_state for update using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);

-- notes: jeder Spieler sieht/schreibt nur seine eigenen Notizen,
-- der Meister sieht ALLE Notizen seiner Kampagnen (Live-Mitlesen!)
create policy "notes_select_own_or_master" on notes for select using (
  user_id = auth.uid()
  or exists (
    select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id)
  )
);
create policy "notes_insert_own" on notes for insert with check (user_id = auth.uid());
create policy "notes_update_own" on notes for update using (user_id = auth.uid());

-- ============================================================
-- REALTIME
-- Damit Änderungen live bei allen ankommen (Notizen, aktive Karte),
-- müssen die Tabellen für Supabase Realtime freigegeben werden.
-- ============================================================
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table campaign_state;
