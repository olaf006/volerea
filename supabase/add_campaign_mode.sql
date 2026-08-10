-- Erweiterung der Kampagnen: Modus (normal/anfänger) und Hausregeln,
-- die der Meister beim Erstellen festlegt und die Spieler beim
-- Charaktererstellen sehen.
alter table campaigns add column if not exists mode text not null default 'normal' check (mode in ('normal', 'anfaenger'));
alter table campaigns add column if not exists house_rules text not null default '';
