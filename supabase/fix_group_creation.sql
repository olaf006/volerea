-- Fix: Der Ersteller (Owner) einer Gruppe darf sie immer sehen,
-- auch bevor der group_members-Eintrag existiert.
create policy "groups_select_owner" on groups for select using (owner_id = auth.uid());
