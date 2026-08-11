-- Neue Pins starten "unplatziert" (in der Liste), bis der Meister sie
-- per Drag & Drop auf die Karte zieht.
alter table map_tokens add column if not exists placed boolean not null default false;

-- Spieler-eigene Pins sollen weiterhin sofort sichtbar sein
update map_tokens set placed = true where owner_user_id is not null;
