-- Erlaubt dem Meister, Karten wieder zu löschen
create policy "maps_delete_master" on maps for delete using (
  exists (select 1 from campaigns c where c.id = campaign_id and is_group_master(c.group_id))
);
