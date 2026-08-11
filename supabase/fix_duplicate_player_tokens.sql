-- Aufräumen: falls beim Testen schon doppelte Spieler-Pins entstanden
-- sind, den jeweils ältesten davon löschen (WICHTIG: das muss vor dem
-- Anlegen der Unique-Regel passieren, sonst schlägt die fehl).
delete from map_tokens a using map_tokens b
where a.owner_user_id is not null
  and a.owner_user_id = b.owner_user_id
  and a.map_id = b.map_id
  and a.created_at < b.created_at;

-- Sicherheitsnetz: pro Karte darf ein Spieler nur EINEN eigenen Pin haben.
-- Verhindert doppelte Spieler-Pins auch dann, wenn der Browser mal
-- zweimal gleichzeitig versucht, einen anzulegen.
create unique index if not exists map_tokens_unique_player_per_map
  on map_tokens (map_id, owner_user_id)
  where owner_user_id is not null;
