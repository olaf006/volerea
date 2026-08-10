-- Erlaubt das Löschen eines Charakters: der Spieler selbst darf seinen
-- eigenen löschen, der Meister darf jeden Charakter seiner Kampagnen löschen.
create policy "characters_delete_own_or_master" on characters for delete using (
  user_id = auth.uid()
  or exists (
    select 1 from campaigns c
    where c.id = campaign_id and is_group_master(c.group_id)
  )
);
