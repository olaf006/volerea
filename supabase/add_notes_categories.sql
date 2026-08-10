-- Kategorisierte Notizen des Meisters: statt einem einzelnen Textfeld
-- jetzt eine Liste von "Ordnern" mit Titel + Inhalt.
alter table campaigns add column if not exists notes_categories jsonb not null default '[]'::jsonb;
