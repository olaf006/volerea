-- Ohne das werden gelöschte Pins nicht live an andere Clients gemeldet,
-- weil die Löschmeldung sonst nicht genug Info enthält, um den Filter
-- (map_id) zu erfüllen.
alter table map_tokens replica identity full;
