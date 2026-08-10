// Referenzdaten nach den D&D-5e-Regeln: Fertigkeiten, Ausrüstungspakete,
// Zauber. Das hält die Charaktererstellung nah am offiziellen Regelwerk,
// ohne dass Spieler alles selbst nachschlagen müssen.

export const RACES = [
  "Mensch",
  "Elf",
  "Zwerg",
  "Halbling",
  "Halbork",
  "Halbelf",
  "Gnom",
  "Drachenblütiger",
  "Tiefling",
];

export const CLASSES = [
  "Krieger",
  "Magier",
  "Kleriker",
  "Schurke",
  "Waldläufer",
  "Paladin",
  "Barbar",
  "Barde",
  "Druide",
  "Hexenmeister",
  "Mönch",
  "Zauberer",
] as const;

export type CharClass = (typeof CLASSES)[number];

export const HIT_DICE: Record<CharClass, number> = {
  Barbar: 12,
  Krieger: 10,
  Paladin: 10,
  Waldläufer: 10,
  Kleriker: 8,
  Schurke: 8,
  Barde: 8,
  Druide: 8,
  Mönch: 8,
  Hexenmeister: 8,
  Magier: 6,
  Zauberer: 6,
};

// Die 18 offiziellen Fertigkeiten, jeweils an ein Attribut gekoppelt
export const SKILLS: { name: string; ability: string }[] = [
  { name: "Akrobatik", ability: "Geschicklichkeit" },
  { name: "Arkane Kunde", ability: "Intelligenz" },
  { name: "Athletik", ability: "Stärke" },
  { name: "Auftreten", ability: "Charisma" },
  { name: "Einschüchtern", ability: "Charisma" },
  { name: "Fingerfertigkeit", ability: "Geschicklichkeit" },
  { name: "Geschichte", ability: "Intelligenz" },
  { name: "Heilkunde", ability: "Weisheit" },
  { name: "Heimlichkeit", ability: "Geschicklichkeit" },
  { name: "Menschenkenntnis", ability: "Weisheit" },
  { name: "Mit Tieren umgehen", ability: "Weisheit" },
  { name: "Nachforschung", ability: "Intelligenz" },
  { name: "Naturkunde", ability: "Intelligenz" },
  { name: "Religion", ability: "Intelligenz" },
  { name: "Täuschung", ability: "Charisma" },
  { name: "Überlebenskunst", ability: "Weisheit" },
  { name: "Überzeugen", ability: "Charisma" },
  { name: "Wahrnehmung", ability: "Weisheit" },
];

// Wie viele Fertigkeiten jede Klasse wählen darf, und aus welcher Liste
// (nach den offiziellen Klassentabellen im Regelwerk)
export const CLASS_SKILL_CHOICES: Record<
  CharClass,
  { count: number; options: string[] }
> = {
  Barbar: {
    count: 2,
    options: ["Mit Tieren umgehen", "Einschüchtern", "Naturkunde", "Wahrnehmung", "Überlebenskunst"],
  },
  Barde: {
    count: 3,
    options: SKILLS.map((s) => s.name), // Barden dürfen aus allen wählen
  },
  Druide: {
    count: 2,
    options: ["Mit Tieren umgehen", "Arkane Kunde", "Wahrnehmung", "Heilkunde", "Religion", "Naturkunde", "Überlebenskunst", "Einschüchtern"],
  },
  Hexenmeister: {
    count: 2,
    options: ["Arkane Kunde", "Täuschung", "Geschichte", "Einschüchtern", "Nachforschung", "Naturkunde", "Religion"],
  },
  Kleriker: {
    count: 2,
    options: ["Geschichte", "Menschenkenntnis", "Heilkunde", "Religion", "Überzeugen"],
  },
  Krieger: {
    count: 2,
    options: ["Akrobatik", "Mit Tieren umgehen", "Athletik", "Geschichte", "Einschüchtern", "Wahrnehmung", "Überlebenskunst"],
  },
  Magier: {
    count: 2,
    options: ["Arkane Kunde", "Geschichte", "Menschenkenntnis", "Nachforschung", "Heilkunde", "Religion"],
  },
  Mönch: {
    count: 2,
    options: ["Akrobatik", "Athletik", "Geschichte", "Menschenkenntnis", "Religion", "Heimlichkeit"],
  },
  Paladin: {
    count: 2,
    options: ["Athletik", "Einschüchtern", "Religion", "Überzeugen", "Heilkunde", "Menschenkenntnis"],
  },
  Schurke: {
    count: 4,
    options: ["Akrobatik", "Athletik", "Täuschung", "Einschüchtern", "Nachforschung", "Menschenkenntnis", "Fingerfertigkeit", "Wahrnehmung", "Auftreten", "Überzeugen", "Heimlichkeit"],
  },
  Waldläufer: {
    count: 3,
    options: ["Mit Tieren umgehen", "Athletik", "Wahrnehmung", "Heimlichkeit", "Überlebenskunst", "Naturkunde"],
  },
  Zauberer: {
    count: 2,
    options: ["Arkane Kunde", "Täuschung", "Einschüchtern", "Nachforschung", "Menschenkenntnis", "Religion"],
  },
};

// Rüstungsart bestimmt, wie stark der Geschicklichkeitsbonus in die
// Rüstungsklasse (AC) einfließt - nach den offiziellen Rüstungsregeln.
export type ArmorType = "none" | "light" | "medium" | "heavy";

export interface EquipmentPackage {
  label: string;
  items: string;
  armorType: ArmorType;
  baseAc: number; // bei "none" wird das ignoriert (10 + Dex wird genutzt)
  shield: boolean;
}

export const EQUIPMENT_PACKAGES: Record<CharClass, EquipmentPackage[]> = {
  Barbar: [
    { label: "Großaxt & Wurfspeere", items: "Großaxt, 4 Wurfspeere, Entdeckerausrüstung", armorType: "none", baseAc: 0, shield: false },
    { label: "Zwei Handäxte", items: "2 Handäxte, Entdeckerausrüstung", armorType: "none", baseAc: 0, shield: false },
  ],
  Krieger: [
    { label: "Kettenhemd & Schild", items: "Kettenhemd, Schild, Langschwert", armorType: "medium", baseAc: 13, shield: true },
    { label: "Lederrüstung & zwei Schwerter", items: "Lederrüstung, Langbogen, 2 Kurzschwerter", armorType: "light", baseAc: 11, shield: false },
  ],
  Paladin: [
    { label: "Kettenrüstung & Schild", items: "Kettenrüstung, Schild, Streitkolben", armorType: "heavy", baseAc: 16, shield: true },
    { label: "Kettenhemd & Zweihandwaffe", items: "Kettenhemd, Kriegshammer (zweihändig)", armorType: "medium", baseAc: 13, shield: false },
  ],
  Waldläufer: [
    { label: "Lederrüstung & Langbogen", items: "Lederrüstung, Langbogen, 2 Kurzschwerter", armorType: "light", baseAc: 11, shield: false },
    { label: "Lederrüstung & zwei Äxte", items: "Lederrüstung, 2 Handäxte, Kurzbogen", armorType: "light", baseAc: 11, shield: false },
  ],
  Schurke: [
    { label: "Lederrüstung & Rapier", items: "Lederrüstung, Rapier, 2 Dolche, Diebeswerkzeug", armorType: "light", baseAc: 11, shield: false },
    { label: "Lederrüstung & Kurzbogen", items: "Lederrüstung, Kurzbogen, 2 Dolche, Diebeswerkzeug", armorType: "light", baseAc: 11, shield: false },
  ],
  Mönch: [
    { label: "Kurzschwert & Wurfspeere", items: "Kurzschwert, 5 Wurfspeere", armorType: "none", baseAc: 0, shield: false },
    { label: "Nahkampfwaffe & Fernwaffe", items: "Einfache Nahkampfwaffe, Kurzbogen", armorType: "none", baseAc: 0, shield: false },
  ],
  Kleriker: [
    { label: "Schuppenpanzer & Schild", items: "Schuppenpanzer, Schild, Kriegshammer", armorType: "medium", baseAc: 14, shield: true },
    { label: "Lederrüstung & Stab", items: "Lederrüstung, Streitkolben, Wurfspeere", armorType: "light", baseAc: 11, shield: false },
  ],
  Druide: [
    { label: "Lederrüstung & Schild", items: "Lederrüstung (nichtmetallisch), Holzschild, Krummsäbel", armorType: "light", baseAc: 11, shield: true },
    { label: "Nur Waffe", items: "Krummsäbel, Wurfspeere, Naturwerkzeug", armorType: "none", baseAc: 0, shield: false },
  ],
  Barde: [
    { label: "Lederrüstung & Rapier", items: "Lederrüstung, Rapier, Diplomatenausrüstung", armorType: "light", baseAc: 11, shield: false },
    { label: "Ohne Rüstung & Kurzbogen", items: "Kurzbogen, Dolch, Unterhalterausrüstung", armorType: "none", baseAc: 0, shield: false },
  ],
  Hexenmeister: [
    { label: "Lederrüstung & Dolche", items: "Lederrüstung, 2 Dolche, Zauberkomponentenbeutel", armorType: "light", baseAc: 11, shield: false },
    { label: "Einfache Waffe & Fokus", items: "Einfache Waffe, arkaner Fokus", armorType: "none", baseAc: 0, shield: false },
  ],
  Magier: [
    { label: "Dolch & Zauberbuch", items: "Dolch, Zauberbuch, Zauberkomponentenbeutel", armorType: "none", baseAc: 0, shield: false },
    { label: "Kampfstab & Zauberbuch", items: "Kampfstab, Zauberbuch, Gelehrtenausrüstung", armorType: "none", baseAc: 0, shield: false },
  ],
  Zauberer: [
    { label: "Zwei Dolche & Fokus", items: "2 Dolche, arkaner Fokus", armorType: "none", baseAc: 0, shield: false },
    { label: "Armbrust & Fokus", items: "Leichte Armbrust, 20 Bolzen, arkaner Fokus", armorType: "none", baseAc: 0, shield: false },
  ],
};

// Zauberkundige Klassen ab Stufe 1, mit Anzahl wählbarer Zaubertricks
// (unbegrenzt nutzbar) und Zauber 1. Grades (verbrauchen einen Zauberplatz
// pro Anwendung, bis zur nächsten Rast).
export interface SpellInfo {
  name: string;
  description: string;
}

export interface CasterInfo {
  ability: "Intelligenz" | "Weisheit" | "Charisma";
  cantripsKnown: number;
  level1Known: number;
  cantrips: SpellInfo[];
  level1: SpellInfo[];
}

export const SPELLCASTING: Partial<Record<CharClass, CasterInfo>> = {
  Magier: {
    ability: "Intelligenz",
    cantripsKnown: 3,
    level1Known: 4,
    cantrips: [
      { name: "Feuerpfeil", description: "Fernkampf-Angriff, macht Feuerschaden. Kein Ressourcenverbrauch, beliebig oft nutzbar." },
      { name: "Trugbild", description: "Erzeugt eine kleine Illusion. Unbegrenzt nutzbar, kein Zauberplatz nötig." },
      { name: "Licht", description: "Lässt ein Objekt leuchten wie eine Fackel. Unbegrenzt nutzbar." },
      { name: "Frostspeer", description: "Nahkampf-Berührungsangriff mit Kälteschaden, verlangsamt das Ziel. Unbegrenzt nutzbar." },
      { name: "Nachricht", description: "Flüstert eine kurze Botschaft an jemanden in der Nähe. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Magisches Geschoss", description: "Trifft automatisch, macht Kraftschaden. Verbraucht einen Zauberplatz pro Wirken, davon hast du am Anfang 2." },
      { name: "Schild", description: "Reaktion, erhöht kurzzeitig deine Rüstungsklasse. Verbraucht einen Zauberplatz." },
      { name: "Person bezaubern", description: "Versucht, eine Person dir gegenüber freundlich zu stimmen. Verbraucht einen Zauberplatz." },
      { name: "Schlaf", description: "Versetzt schwache Gegner in der Nähe in Schlaf. Verbraucht einen Zauberplatz." },
    ],
  },
  Kleriker: {
    ability: "Weisheit",
    cantripsKnown: 3,
    level1Known: 3,
    cantrips: [
      { name: "Licht", description: "Lässt ein Objekt leuchten. Unbegrenzt nutzbar." },
      { name: "Führung", description: "Gibt einem Verbündeten einen kleinen Bonus auf einen Wurf. Unbegrenzt nutzbar." },
      { name: "Schaden abwenden", description: "Reaktion, verringert erlittenen Schaden. Unbegrenzt nutzbar." },
      { name: "Trickserei", description: "Kleine, harmlose magische Effekte. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Segen", description: "Bis zu 3 Verbündete erhalten Bonus auf Angriffs- und Rettungswürfe. Verbraucht einen Zauberplatz." },
      { name: "Person bewachen", description: "Schützt eine Person magisch. Verbraucht einen Zauberplatz." },
    ],
  },
  Druide: {
    ability: "Weisheit",
    cantripsKnown: 2,
    level1Known: 3,
    cantrips: [
      { name: "Giftig", description: "Fügt einem Ziel in Reichweite Giftschaden zu. Unbegrenzt nutzbar." },
      { name: "Wachsen lassen", description: "Kleine Naturmagie zur Manipulation von Pflanzen. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Donnerwoge", description: "Stößt Kreaturen um dich herum zurück. Verbraucht einen Zauberplatz." },
      { name: "Nebel entfachen", description: "Erzeugt eine Nebelwolke zur Tarnung. Verbraucht einen Zauberplatz." },
    ],
  },
  Barde: {
    ability: "Charisma",
    cantripsKnown: 2,
    level1Known: 4,
    cantrips: [
      { name: "Spott", description: "Schwächt einen Gegner psychisch mit Spottschaden. Unbegrenzt nutzbar." },
      { name: "Licht", description: "Lässt ein Objekt leuchten. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Person bezaubern", description: "Versucht, eine Person freundlich zu stimmen. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Heilendes Wort", description: "Heilt aus der Ferne, ohne Berührung. Verbraucht einen Zauberplatz." },
      { name: "Schlaf", description: "Versetzt schwache Gegner in Schlaf. Verbraucht einen Zauberplatz." },
      { name: "Tarnung", description: "Macht ein Ziel unsichtbar, bis es angreift. Verbraucht einen Zauberplatz." },
    ],
  },
  Hexenmeister: {
    ability: "Charisma",
    cantripsKnown: 2,
    level1Known: 2,
    cantrips: [
      { name: "Augenlicht rauben", description: "Fernkampfzauber, macht nekrotischen Schaden. Unbegrenzt nutzbar." },
      { name: "Nachricht", description: "Flüstert eine kurze Botschaft. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Höllischer Tadel", description: "Reaktion, wenn dich jemand trifft, fügst du Feuerschaden zu. Verbraucht einen Zauberplatz." },
      { name: "Person bezaubern", description: "Versucht, eine Person freundlich zu stimmen. Verbraucht einen Zauberplatz." },
    ],
  },
  Zauberer: {
    ability: "Charisma",
    cantripsKnown: 4,
    level1Known: 2,
    cantrips: [
      { name: "Feuerpfeil", description: "Fernkampf-Angriff mit Feuerschaden. Unbegrenzt nutzbar." },
      { name: "Frostspeer", description: "Nahkampf-Berührungsangriff mit Kälteschaden. Unbegrenzt nutzbar." },
      { name: "Licht", description: "Lässt ein Objekt leuchten. Unbegrenzt nutzbar." },
      { name: "Trickserei", description: "Kleine magische Effekte. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Magisches Geschoss", description: "Trifft automatisch, macht Kraftschaden. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Schild", description: "Reaktion, erhöht kurzzeitig deine Rüstungsklasse. Verbraucht einen Zauberplatz." },
    ],
  },
  Paladin: {
    ability: "Charisma",
    cantripsKnown: 0,
    level1Known: 2,
    cantrips: [],
    level1: [
      { name: "Segen", description: "Bis zu 3 Verbündete erhalten Bonus auf Angriffs- und Rettungswürfe. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Göttliche Gunst", description: "Deine Waffenangriffe machen zusätzlichen Strahlungsschaden. Verbraucht einen Zauberplatz." },
      { name: "Sengender Blitz", description: "Dein nächster Waffentreffer macht zusätzlichen Feuerschaden. Verbraucht einen Zauberplatz." },
      { name: "Schutz vor Gutem und Bösem", description: "Schützt ein Ziel vor bestimmten Kreaturentypen. Verbraucht einen Zauberplatz." },
    ],
  },
  Waldläufer: {
    ability: "Weisheit",
    cantripsKnown: 0,
    level1Known: 2,
    cantrips: [],
    level1: [
      { name: "Zeichen des Jägers", description: "Markiert ein Ziel, gegen das du mehr Schaden machst. Gehört automatisch zu deinen vorbereiteten Zaubern und ist einige Male pro Tag ohne Zauberplatz nutzbar." },
      { name: "Tiersprache", description: "Du kannst dich einfach mit Tieren verständigen. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Alarm", description: "Legt eine magische Warnung um einen Bereich. Verbraucht einen Zauberplatz." },
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz." },
    ],
  },
};

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

// ============================================================
// KLASSEN-MERKMALE (Stufe 1, 2024-Regeln)
// Die Fähigkeiten, die jede Klasse ab Stufe 1 automatisch mitbringt.
// Bei manchen Klassen gibt es eine Wahl (z.B. Kampfstil beim Krieger),
// die im Formular als Auswahl angezeigt wird.
// ============================================================

export interface ClassFeature {
  name: string;
  description: string;
}

export const CLASS_FEATURES: Record<CharClass, ClassFeature[]> = {
  Barbar: [
    { name: "Wut", description: "Bonusaktion: Du erhältst zusätzlichen Nahkampfschaden und Resistenz gegen Wuchtschlag-, Hieb- und Stichschaden. Auf Stufe 1 zweimal pro lange Rast nutzbar." },
    { name: "Unbewaffnete Verteidigung", description: "Ohne Rüstung ist deine Rüstungsklasse 10 + Geschicklichkeit + Konstitution." },
    { name: "Waffenmeisterschaft", description: "Du wählst 2 Waffentypen, mit denen du einen besonderen Kampfeffekt nutzen kannst (z.B. Ziel zu Boden zwingen)." },
  ],
  Barde: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Charisma, mit einem Musikinstrument als Fokus." },
    { name: "Bardische Inspiration", description: "Bonusaktion: Ein Verbündeter in der Nähe erhält einen W6, den er einmal auf einen Wurf seiner Wahl addieren darf." },
  ],
  Druide: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Weisheit, mit einem druidischen Fokus (z.B. Mistelzweig)." },
    { name: "Druidisch", description: "Du kennst die Geheimsprache der Druiden." },
    { name: "Urwüchsiger Orden", description: "Wähle: Magier (deine Zaubertricks machen mehr Schaden) oder Wächter (du übst dich in Rüstung und Kampfwaffen)." },
  ],
  Hexenmeister: [
    { name: "Paktmagie", description: "Du wirkst Zauber über Charisma. Deine Zauberplätze erneuern sich schon nach einer kurzen Rast, nicht erst nach einer langen." },
  ],
  Kleriker: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Weisheit, mit einem heiligen Symbol als Fokus." },
    { name: "Göttlicher Orden", description: "Wähle: Beschützer (du kämpfst wirkungsvoller im Nahkampf) oder Gedanke (deine Heilzauber heilen mehr)." },
  ],
  Krieger: [
    { name: "Kampfstil", description: "Du wählst eine dauerhafte Spezialisierung, die deinen Kampfstil verbessert." },
    { name: "Zweiter Atem", description: "Bonusaktion: Einmal pro kurze Rast heilst du dich um 1W10 + deine Kriegerstufe." },
    { name: "Waffenmeisterschaft", description: "Du wählst 3 Waffentypen, mit denen du einen besonderen Kampfeffekt nutzen kannst." },
  ],
  Magier: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Intelligenz, mit deinem Zauberbuch." },
    { name: "Ritualzauber", description: "Zauber mit der Ritual-Eigenschaft kannst du ohne Zauberplatz wirken, wenn du dir extra Zeit lässt." },
    { name: "Arkane Wiederherstellung", description: "Einmal täglich nach einer kurzen Rast bekommst du einen Teil deiner Zauberplätze zurück." },
  ],
  Mönch: [
    { name: "Kampfkunst", description: "Deine unbewaffneten Schläge nutzen einen Kampfkunst-Würfel statt normalem Schaden und du darfst als Bonusaktion einen weiteren Schlag austeilen." },
    { name: "Unbewaffnete Verteidigung", description: "Ohne Rüstung ist deine Rüstungsklasse 10 + Geschicklichkeit + Weisheit." },
  ],
  Paladin: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Charisma (seit den 2024-Regeln schon ab Stufe 1, vorher erst ab Stufe 2)." },
    { name: "Handauflegen", description: "Du hast einen Heilpool von 5 × deiner Stufe Lebenspunkten, den du per Berührung auf Verbündete verteilen kannst." },
    { name: "Waffenmeisterschaft", description: "Du wählst 2 Waffentypen, mit denen du einen besonderen Kampfeffekt nutzen kannst." },
  ],
  Schurke: [
    { name: "Expertise", description: "Bei 2 deiner geübten Fertigkeiten zählt dein Übungsbonus doppelt." },
    { name: "Hinterhältiger Angriff", description: "Einmal pro Zug machst du 1W6 zusätzlichen Schaden, wenn du im Vorteil bist oder ein Verbündeter neben deinem Ziel steht." },
    { name: "Rotwelsch", description: "Du kennst die Geheimsprache der Diebe, um verdeckt zu kommunizieren." },
  ],
  Waldläufer: [
    { name: "Zauberkunde", description: "Du wirkst Zauber über Weisheit (seit den 2024-Regeln schon ab Stufe 1, vorher erst ab Stufe 2)." },
    { name: "Günstlingsfeind", description: "Zeichen des Jägers gehört zu deinen vorbereiteten Zaubern und du kannst es zusätzlich einige Male pro Tag ohne Zauberplatz wirken." },
    { name: "Waffenmeisterschaft", description: "Du wählst 2 Waffentypen, mit denen du einen besonderen Kampfeffekt nutzen kannst." },
  ],
  Zauberer: [
    { name: "Angeborene Zauberkraft", description: "Du wirkst Zauber über Charisma, rein aus dir selbst heraus, ohne Zauberbuch oder Fokus." },
    { name: "Zauberursprung", description: "Die Quelle deiner Magie (z.B. Drachenblut) gibt dir eine zusätzliche kleine Fähigkeit." },
  ],
};

export const FIGHTING_STYLES = [
  { name: "Verteidigung", description: "+1 auf deine Rüstungsklasse, solange du Rüstung trägst." },
  { name: "Duellieren", description: "+2 Schaden mit einer einhändigen Waffe, wenn du keine andere Waffe in der zweiten Hand hältst." },
  { name: "Bogenschütze", description: "+2 auf Trefferwürfe mit Fernkampfwaffen." },
  { name: "Zweihandkampf", description: "Bei zweihändigen Waffen darfst du eine 1 oder 2 auf dem Schadenswürfel neu würfeln." },
];

export const DIVINE_ORDERS = [
  { name: "Beschützer", description: "Du kämpfst wirkungsvoller im Nahkampf und kannst Waffen mit Weisheit statt Stärke/Geschicklichkeit einsetzen." },
  { name: "Gedanke", description: "Deine Heilzauber heilen zusätzlich um deinen Weisheitsmodifikator." },
];

export const PRIMAL_ORDERS = [
  { name: "Magier", description: "Deine Zaubertricks machen bei bestimmten Zielen mehr Schaden." },
  { name: "Wächter", description: "Du übst dich zusätzlich in mittlerer Rüstung und Kampfwaffen." },
];

// ============================================================
// HINTERGRÜNDE (2024-Regeln)
// In den überarbeiteten 2024-Regeln kommen die Attributsboni und ein
// Starttalent vom Hintergrund, nicht mehr von der Rasse/Spezies.
// Jeder Hintergrund listet 3 Attribute (davon +2 auf eins, +1 auf ein
// anderes ODER +1 auf alle drei), 2 feste Fertigkeiten, 1 Werkzeug,
// Startausrüstung und ein Ursprungstalent.
// ============================================================

export type AbilityKeyName =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export const ABILITY_GERMAN: Record<AbilityKeyName, string> = {
  strength: "Stärke",
  dexterity: "Geschicklichkeit",
  constitution: "Konstitution",
  intelligence: "Intelligenz",
  wisdom: "Weisheit",
  charisma: "Charisma",
};

export interface OriginFeat {
  key: string;
  name: string;
  description: string;
}

export const ORIGIN_FEATS: Record<string, OriginFeat> = {
  alert: {
    key: "alert",
    name: "Alarmbereit",
    description: "Du addierst deinen Übungsbonus auf Initiative-Würfe und bist schwerer zu überraschen.",
  },
  crafter: {
    key: "crafter",
    name: "Handwerker",
    description: "Du stellst Gegenstände günstiger her, brauchst weniger Zeit dafür, und beherrschst 3 Handwerkszeuge.",
  },
  healer: {
    key: "healer",
    name: "Heiler",
    description: "Mit einem Erste-Hilfe-Set kannst du Verbündete zusätzlich heilen, wenn du sie stabilisierst oder verarztest.",
  },
  lucky: {
    key: "lucky",
    name: "Glückspilz",
    description: "Du hast Glückspunkte, mit denen du einen Wurf (deinen oder gegen dich) noch einmal würfeln kannst.",
  },
  magic_initiate: {
    key: "magic_initiate",
    name: "Arkaner Anfänger",
    description: "Du lernst 2 Zaubertricks und einen Zauber 1. Grades einer anderen Klasse, den du einmal pro Rast ohne Zauberplatz wirken kannst.",
  },
  musician: {
    key: "musician",
    name: "Musikant",
    description: "Du beherrschst ein Musikinstrument und kannst durch Musizieren erschöpften Verbündeten nach einer Rast Heldenmut geben.",
  },
  savage_attacker: {
    key: "savage_attacker",
    name: "Wilder Angreifer",
    description: "Einmal pro Zug darfst du deinen Schadenswurf im Nahkampf zweimal würfeln und das bessere Ergebnis nehmen.",
  },
  skilled: {
    key: "skilled",
    name: "Vielseitig",
    description: "Du wirst in 3 zusätzlichen Fertigkeiten oder Werkzeugen deiner Wahl geübt.",
  },
  tavern_brawler: {
    key: "tavern_brawler",
    name: "Kneipenschläger",
    description: "Deine unbewaffneten Schläge machen mehr Schaden und du kannst Gegner damit zurückstoßen.",
  },
  tough: {
    key: "tough",
    name: "Zäh",
    description: "Deine maximalen Lebenspunkte erhöhen sich sofort um das Doppelte deiner Stufe (also +2 auf Stufe 1) und um weitere 2 bei jeder Stufe danach.",
  },
};

export interface Background {
  name: string;
  abilities: [AbilityKeyName, AbilityKeyName, AbilityKeyName];
  skills: [string, string];
  tool: string;
  featKey: string;
  equipment: string;
}

export const BACKGROUNDS: Background[] = [
  { name: "Akolyth", abilities: ["intelligence", "wisdom", "charisma"], skills: ["Menschenkenntnis", "Religion"], tool: "Kalligraphie-Werkzeug", featKey: "magic_initiate", equipment: "Gebetsbuch, Räucherstäbchen, Talisman, Gewand, 8 GS" },
  { name: "Handwerker", abilities: ["strength", "dexterity", "intelligence"], skills: ["Nachforschung", "Überzeugen"], tool: "Handwerkszeug nach Wahl", featKey: "crafter", equipment: "Handwerkszeug, 2 Kostüme, 32 GS" },
  { name: "Scharlatan", abilities: ["dexterity", "constitution", "charisma"], skills: ["Täuschung", "Fingerfertigkeit"], tool: "Fälscherwerkzeug", featKey: "skilled", equipment: "Fälscherwerkzeug, feine Kleidung, 15 GS" },
  { name: "Verbrecher", abilities: ["dexterity", "constitution", "intelligence"], skills: ["Fingerfertigkeit", "Heimlichkeit"], tool: "Diebeswerkzeug", featKey: "alert", equipment: "Diebeswerkzeug, Brecheisen, 2 Dolche, 16 GS" },
  { name: "Unterhalter", abilities: ["strength", "dexterity", "charisma"], skills: ["Akrobatik", "Auftreten"], tool: "Verkleidungsset", featKey: "musician", equipment: "Musikinstrument, 2 Kostüme, 11 GS" },
  { name: "Bauer", abilities: ["strength", "constitution", "wisdom"], skills: ["Mit Tieren umgehen", "Naturkunde"], tool: "Zimmermannswerkzeug", featKey: "tough", equipment: "Sichel, Ochsenkarren, Entdeckerausrüstung, 30 GS" },
  { name: "Wächter", abilities: ["strength", "intelligence", "wisdom"], skills: ["Athletik", "Wahrnehmung"], tool: "Spielset", featKey: "alert", equipment: "Speer, leichte Armbrust, Entdeckerausrüstung, 12 GS" },
  { name: "Wegweiser", abilities: ["dexterity", "constitution", "wisdom"], skills: ["Heimlichkeit", "Überlebenskunst"], tool: "Kartografenwerkzeug", featKey: "magic_initiate", equipment: "Steigeisen, Zelt, Entdeckerausrüstung, 3 GS" },
  { name: "Einsiedler", abilities: ["constitution", "wisdom", "charisma"], skills: ["Heilkunde", "Religion"], tool: "Kräuterkunde-Set", featKey: "healer", equipment: "Kräuterkunde-Set, Decke, Lampe, 16 GS" },
  { name: "Händler", abilities: ["constitution", "intelligence", "charisma"], skills: ["Mit Tieren umgehen", "Überzeugen"], tool: "Navigationswerkzeug", featKey: "lucky", equipment: "Navigationswerkzeug, Waage, Entdeckerausrüstung, 22 GS" },
  { name: "Adliger", abilities: ["strength", "intelligence", "charisma"], skills: ["Geschichte", "Überzeugen"], tool: "Spielset", featKey: "skilled", equipment: "Feine Kleidung, Siegelring, 29 GS" },
  { name: "Gelehrter", abilities: ["constitution", "intelligence", "wisdom"], skills: ["Arkane Kunde", "Geschichte"], tool: "Kalligraphie-Werkzeug", featKey: "magic_initiate", equipment: "Buch, Tintenfass, Pergament, 8 GS" },
  { name: "Seefahrer", abilities: ["strength", "dexterity", "wisdom"], skills: ["Akrobatik", "Wahrnehmung"], tool: "Navigationswerkzeug", featKey: "tavern_brawler", equipment: "Dolch, Seil, Entdeckerausrüstung, 20 GS" },
  { name: "Schreiber", abilities: ["dexterity", "intelligence", "wisdom"], skills: ["Nachforschung", "Wahrnehmung"], tool: "Kalligraphie-Werkzeug", featKey: "skilled", equipment: "Feder-Set, Lampe, Pergament, 23 GS" },
  { name: "Soldat", abilities: ["strength", "dexterity", "constitution"], skills: ["Athletik", "Einschüchtern"], tool: "Spielset", featKey: "savage_attacker", equipment: "Speer, kurze Armbrust, Entdeckerausrüstung, 14 GS" },
  { name: "Wayfarer", abilities: ["dexterity", "wisdom", "charisma"], skills: ["Menschenkenntnis", "Heimlichkeit"], tool: "Diebeswerkzeug", featKey: "lucky", equipment: "2 Dolche, Diebeswerkzeug, Reisekleidung, 16 GS" },
];
