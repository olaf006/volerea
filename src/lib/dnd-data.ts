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
};

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}
