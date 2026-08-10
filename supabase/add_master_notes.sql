-- Private Notizen des Meisters zur Kampagne (nur für ihn sichtbar/bearbeitbar)
alter table campaigns add column if not exists master_notes text not null default '';
