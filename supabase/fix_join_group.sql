-- Fix: Damit man einer Gruppe per Einladungscode beitreten kann, obwohl man
-- noch kein Mitglied ist (und die normale RLS-Regel das sonst blockiert),
-- nutzen wir eine spezielle Funktion, die NUR die Gruppen-ID anhand des Codes
-- zurückgibt - sonst nichts. Das ist sicher, weil man den korrekten Code
-- kennen muss und man keine anderen Gruppendaten sieht.
create or replace function find_group_by_invite_code(code text)
returns uuid as $$
  select id from groups where invite_code = code;
$$ language sql security definer stable;
