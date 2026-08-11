-- Speichert Waffe und Loot direkt am NPC-Pin, damit der Meister das
-- später wieder einsehen kann (z.B. im HP-Bearbeiten-Fenster).
alter table map_tokens add column if not exists details jsonb not null default '{}'::jsonb;
