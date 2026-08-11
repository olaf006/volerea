-- Erlaubt jedem Gruppenmitglied, einem Ziel-Pin gezielt Schaden zuzufügen
-- (für das Angriffssystem), OHNE dass Spieler generell Pins bearbeiten
-- dürfen, die ihnen nicht gehören. Läuft mit erhöhten Rechten, prüft
-- aber selbst, ob der Aufrufer Mitglied der passenden Kampagne ist.
create or replace function apply_damage(token_id uuid, amount int)
returns void as $$
declare
  v_campaign_id uuid;
begin
  select campaign_id into v_campaign_id from map_tokens where id = token_id;
  if v_campaign_id is null then
    return;
  end if;
  if not exists (
    select 1 from campaigns c where c.id = v_campaign_id and is_group_member(c.group_id)
  ) then
    raise exception 'not authorized';
  end if;

  update map_tokens
    set hp_current = greatest(0, coalesce(hp_current, hp_max, 0) - amount)
    where id = token_id;
end;
$$ language plpgsql security definer;
