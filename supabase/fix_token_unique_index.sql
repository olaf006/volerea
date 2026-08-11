-- Robustere Bereinigung: funktioniert auch, wenn zwei doppelte Pins exakt
-- denselben Zeitstempel haben (das hat die letzte Bereinigung übersehen).
delete from map_tokens
where id in (
  select id from (
    select id, row_number() over (
      partition by map_id, owner_user_id
      order by created_at asc, id asc
    ) as rn
    from map_tokens
    where owner_user_id is not null
  ) t
  where t.rn > 1
);

-- Der vorherige Index war zu "eingeschränkt" (nur für nicht-leere
-- owner_user_id), dadurch konnte der Code seine Update-Regel nicht
-- immer sauber zuordnen. Jetzt ein einfacherer, vollständiger Index -
-- leere Werte (Meister-Pins) stören sich dabei nicht gegenseitig, weil
-- Postgres NULL-Werte nie als "gleich" behandelt.
drop index if exists map_tokens_unique_player_per_map;
create unique index map_tokens_unique_player_per_map on map_tokens (map_id, owner_user_id);
