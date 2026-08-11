-- Erlaubt dem Meister, einem Spieler-Charakter gezielt Schaden zuzufügen
-- (Gegenstück zu apply_damage, aber für echte Charaktere statt Pins).
create or replace function apply_damage_to_character(char_id uuid, amount int)
returns void as $$
declare
  v_campaign_id uuid;
begin
  select campaign_id into v_campaign_id from characters where id = char_id;
  if v_campaign_id is null then
    return;
  end if;
  if not exists (
    select 1 from campaigns c where c.id = v_campaign_id and is_group_master(c.group_id)
  ) then
    raise exception 'not authorized';
  end if;

  update characters
    set hp_current = greatest(0, hp_current - amount)
    where id = char_id;
end;
$$ language plpgsql security definer;
