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
      { name: "Feuerpfeil", description: "Fernkampf-Angriff, macht Feuerschaden. Unbegrenzt nutzbar." },
      { name: "Frostspeer", description: "Nahkampf-Berührungsangriff mit Kälteschaden, verlangsamt das Ziel. Unbegrenzt nutzbar." },
      { name: "Säurespritze", description: "Fernkampf-Angriff mit Säureschaden. Unbegrenzt nutzbar." },
      { name: "Kleine Illusion", description: "Erzeugt ein kleines Bild oder Geräusch. Unbegrenzt nutzbar." },
      { name: "Gaukelei", description: "Kleine, harmlose magische Tricks. Unbegrenzt nutzbar." },
      { name: "Zauberhand", description: "Lässt eine schwebende Geisterhand kleine Aufgaben erledigen. Unbegrenzt nutzbar." },
      { name: "Licht", description: "Lässt ein Objekt leuchten wie eine Fackel. Unbegrenzt nutzbar." },
      { name: "Nachricht", description: "Flüstert eine kurze Botschaft an jemanden in der Nähe. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Magisches Geschoss", description: "Trifft automatisch, macht Kraftschaden. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Schild", description: "Reaktion, erhöht kurzzeitig deine Rüstungsklasse. Verbraucht einen Zauberplatz." },
      { name: "Person bezaubern", description: "Versucht, eine Person dir gegenüber freundlich zu stimmen. Verbraucht einen Zauberplatz." },
      { name: "Schlaf", description: "Versetzt schwache Gegner in der Nähe in Schlaf. Verbraucht einen Zauberplatz." },
      { name: "Brennende Hände", description: "Ein Feuerkegel trifft alle vor dir. Verbraucht einen Zauberplatz." },
      { name: "Magierrüstung", description: "Erhöht deine Rüstungsklasse für Stunden, auch ohne Rüstung. Verbraucht einen Zauberplatz." },
      { name: "Vertrauten rufen", description: "Beschwört einen kleinen Geistvertrauten, der dir zur Hand geht. Verbraucht einen Zauberplatz." },
      { name: "Nebel entfachen", description: "Erzeugt eine Nebelwolke zur Tarnung. Verbraucht einen Zauberplatz." },
    ],
  },
  Kleriker: {
    ability: "Weisheit",
    cantripsKnown: 3,
    level1Known: 3,
    cantrips: [
      { name: "Licht", description: "Lässt ein Objekt leuchten. Unbegrenzt nutzbar." },
      { name: "Führung", description: "Gibt einem Verbündeten einen kleinen Bonus auf einen Wurf. Unbegrenzt nutzbar." },
      { name: "Heiliges Feuer", description: "Fernkampf-Angriff mit Strahlungsschaden. Unbegrenzt nutzbar." },
      { name: "Schaden abwenden", description: "Reaktion, verringert erlittenen Schaden. Unbegrenzt nutzbar." },
      { name: "Trickserei", description: "Kleine, harmlose magische Effekte. Unbegrenzt nutzbar." },
      { name: "Wortlos formen", description: "Formt Gegenstände aus Ton, Stein oder Erde. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Segen", description: "Bis zu 3 Verbündete erhalten Bonus auf Angriffs- und Rettungswürfe. Verbraucht einen Zauberplatz." },
      { name: "Person bewachen", description: "Schützt eine Person magisch. Verbraucht einen Zauberplatz." },
      { name: "Heilendes Wort", description: "Heilt aus der Ferne, ohne Berührung nötig. Verbraucht einen Zauberplatz." },
      { name: "Fluch entfernen", description: "Hebt einen Fluch oder eine magische Bindung auf. Verbraucht einen Zauberplatz." },
      { name: "Wunden verursachen", description: "Nahkampf-Berührungsangriff mit nekrotischem Schaden. Verbraucht einen Zauberplatz." },
    ],
  },
  Druide: {
    ability: "Weisheit",
    cantripsKnown: 2,
    level1Known: 3,
    cantrips: [
      { name: "Giftig", description: "Fügt einem Ziel in Reichweite Giftschaden zu. Unbegrenzt nutzbar." },
      { name: "Wachsen lassen", description: "Kleine Naturmagie zur Manipulation von Pflanzen. Unbegrenzt nutzbar." },
      { name: "Führung", description: "Gibt einem Verbündeten einen kleinen Bonus auf einen Wurf. Unbegrenzt nutzbar." },
      { name: "Frostspeer", description: "Nahkampf-Berührungsangriff mit Kälteschaden. Unbegrenzt nutzbar." },
      { name: "Wortlos formen", description: "Formt Ton, Stein oder Erde. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Donnerwoge", description: "Stößt Kreaturen um dich herum zurück. Verbraucht einen Zauberplatz." },
      { name: "Nebel entfachen", description: "Erzeugt eine Nebelwolke zur Tarnung. Verbraucht einen Zauberplatz." },
      { name: "Tiersprache", description: "Du kannst dich mit Tieren verständigen. Verbraucht einen Zauberplatz." },
      { name: "Verstricken", description: "Ranken fesseln Gegner in einem Bereich. Verbraucht einen Zauberplatz." },
      { name: "Federfall", description: "Bis zu 5 fallende Kreaturen sinken sanft zu Boden. Verbraucht einen Zauberplatz." },
    ],
  },
  Barde: {
    ability: "Charisma",
    cantripsKnown: 2,
    level1Known: 4,
    cantrips: [
      { name: "Spott", description: "Schwächt einen Gegner psychisch mit Spottschaden. Unbegrenzt nutzbar." },
      { name: "Licht", description: "Lässt ein Objekt leuchten. Unbegrenzt nutzbar." },
      { name: "Zauberhand", description: "Eine schwebende Geisterhand erledigt kleine Aufgaben. Unbegrenzt nutzbar." },
      { name: "Kleine Illusion", description: "Erzeugt ein kleines Bild oder Geräusch. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Person bezaubern", description: "Versucht, eine Person freundlich zu stimmen. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Heilendes Wort", description: "Heilt aus der Ferne, ohne Berührung. Verbraucht einen Zauberplatz." },
      { name: "Schlaf", description: "Versetzt schwache Gegner in Schlaf. Verbraucht einen Zauberplatz." },
      { name: "Tarnung", description: "Macht ein Ziel unsichtbar, bis es angreift. Verbraucht einen Zauberplatz." },
      { name: "Furcht einflößen", description: "Ein Gegner erhält Nachteil, solange er dich sehen kann. Verbraucht einen Zauberplatz." },
      { name: "Freundschaft", description: "Ein Tier oder eine Person wird dir gegenüber freundlich. Verbraucht einen Zauberplatz." },
    ],
  },
  Hexenmeister: {
    ability: "Charisma",
    cantripsKnown: 2,
    level1Known: 2,
    cantrips: [
      { name: "Augenlicht rauben", description: "Fernkampfzauber, macht nekrotischen Schaden. Unbegrenzt nutzbar." },
      { name: "Nachricht", description: "Flüstert eine kurze Botschaft. Unbegrenzt nutzbar." },
      { name: "Kleine Illusion", description: "Erzeugt ein kleines Bild oder Geräusch. Unbegrenzt nutzbar." },
      { name: "Gaukelei", description: "Kleine magische Tricks. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Höllischer Tadel", description: "Reaktion, wenn dich jemand trifft, fügst du Feuerschaden zu. Verbraucht einen Zauberplatz." },
      { name: "Person bezaubern", description: "Versucht, eine Person freundlich zu stimmen. Verbraucht einen Zauberplatz." },
      { name: "Trugbilder", description: "Erschafft täuschend echte Doppelgänger von dir. Verbraucht einen Zauberplatz." },
      { name: "Unsichtbarer Diener", description: "Beschwört einen unsichtbaren, dienenden Geist. Verbraucht einen Zauberplatz." },
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
      { name: "Zauberhand", description: "Eine schwebende Geisterhand erledigt kleine Aufgaben. Unbegrenzt nutzbar." },
      { name: "Säurespritze", description: "Fernkampf-Angriff mit Säureschaden. Unbegrenzt nutzbar." },
    ],
    level1: [
      { name: "Magisches Geschoss", description: "Trifft automatisch, macht Kraftschaden. Verbraucht einen Zauberplatz, davon hast du am Anfang 2." },
      { name: "Schild", description: "Reaktion, erhöht kurzzeitig deine Rüstungsklasse. Verbraucht einen Zauberplatz." },
      { name: "Person bezaubern", description: "Versucht, eine Person freundlich zu stimmen. Verbraucht einen Zauberplatz." },
      { name: "Brennende Hände", description: "Ein Feuerkegel trifft alle vor dir. Verbraucht einen Zauberplatz." },
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
      { name: "Wunden heilen", description: "Heilt einen berührten Verbündeten. Verbraucht einen Zauberplatz." },
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
      { name: "Nebel entfachen", description: "Erzeugt eine Nebelwolke zur Tarnung. Verbraucht einen Zauberplatz." },
    ],
  },
};

// Offizielle XP-Schwellenwerte pro Stufe (Index 0 = Stufe 1, Index 19 = Stufe 20)
export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
  120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(20, level);
}

export function xpForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= 20) return null;
  return XP_THRESHOLDS[currentLevel]; // Index = currentLevel entspricht Schwelle für currentLevel+1
}

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

// Übungsbonus nach Stufe (auf Stufe 1-4 immer +2)
export function proficiencyBonus(level: number) {
  return 2 + Math.floor((level - 1) / 4);
}

// Rettungswurf-Übungen pro Klasse: bei diesen beiden Attributen darfst du
// deinen Übungsbonus zum Rettungswurf addieren (offizielle Klassentabellen)
export const SAVING_THROW_PROFICIENCIES: Record<
  CharClass,
  [AbilityKeyName, AbilityKeyName]
> = {
  Barbar: ["strength", "constitution"],
  Barde: ["dexterity", "charisma"],
  Druide: ["intelligence", "wisdom"],
  Hexenmeister: ["wisdom", "charisma"],
  Kleriker: ["wisdom", "charisma"],
  Krieger: ["strength", "constitution"],
  Magier: ["intelligence", "wisdom"],
  Mönch: ["strength", "dexterity"],
  Paladin: ["wisdom", "charisma"],
  Schurke: ["dexterity", "intelligence"],
  Waldläufer: ["strength", "dexterity"],
  Zauberer: ["constitution", "charisma"],
};

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
  gold: number;
}

export const BACKGROUNDS: Background[] = [
  { name: "Akolyth", abilities: ["intelligence", "wisdom", "charisma"], skills: ["Menschenkenntnis", "Religion"], tool: "Kalligraphie-Werkzeug", featKey: "magic_initiate", equipment: "Gebetsbuch, Räucherstäbchen, Talisman, Gewand, 8 GS", gold: 8 },
  { name: "Handwerker", abilities: ["strength", "dexterity", "intelligence"], skills: ["Nachforschung", "Überzeugen"], tool: "Handwerkszeug nach Wahl", featKey: "crafter", equipment: "Handwerkszeug, 2 Kostüme, 32 GS", gold: 32 },
  { name: "Scharlatan", abilities: ["dexterity", "constitution", "charisma"], skills: ["Täuschung", "Fingerfertigkeit"], tool: "Fälscherwerkzeug", featKey: "skilled", equipment: "Fälscherwerkzeug, feine Kleidung, 15 GS", gold: 15 },
  { name: "Verbrecher", abilities: ["dexterity", "constitution", "intelligence"], skills: ["Fingerfertigkeit", "Heimlichkeit"], tool: "Diebeswerkzeug", featKey: "alert", equipment: "Diebeswerkzeug, Brecheisen, 2 Dolche, 16 GS", gold: 16 },
  { name: "Unterhalter", abilities: ["strength", "dexterity", "charisma"], skills: ["Akrobatik", "Auftreten"], tool: "Verkleidungsset", featKey: "musician", equipment: "Musikinstrument, 2 Kostüme, 11 GS", gold: 11 },
  { name: "Bauer", abilities: ["strength", "constitution", "wisdom"], skills: ["Mit Tieren umgehen", "Naturkunde"], tool: "Zimmermannswerkzeug", featKey: "tough", equipment: "Sichel, Ochsenkarren, Entdeckerausrüstung, 30 GS", gold: 30 },
  { name: "Wächter", abilities: ["strength", "intelligence", "wisdom"], skills: ["Athletik", "Wahrnehmung"], tool: "Spielset", featKey: "alert", equipment: "Speer, leichte Armbrust, Entdeckerausrüstung, 12 GS", gold: 12 },
  { name: "Wegweiser", abilities: ["dexterity", "constitution", "wisdom"], skills: ["Heimlichkeit", "Überlebenskunst"], tool: "Kartografenwerkzeug", featKey: "magic_initiate", equipment: "Steigeisen, Zelt, Entdeckerausrüstung, 3 GS", gold: 3 },
  { name: "Einsiedler", abilities: ["constitution", "wisdom", "charisma"], skills: ["Heilkunde", "Religion"], tool: "Kräuterkunde-Set", featKey: "healer", equipment: "Kräuterkunde-Set, Decke, Lampe, 16 GS", gold: 16 },
  { name: "Händler", abilities: ["constitution", "intelligence", "charisma"], skills: ["Mit Tieren umgehen", "Überzeugen"], tool: "Navigationswerkzeug", featKey: "lucky", equipment: "Navigationswerkzeug, Waage, Entdeckerausrüstung, 22 GS", gold: 22 },
  { name: "Adliger", abilities: ["strength", "intelligence", "charisma"], skills: ["Geschichte", "Überzeugen"], tool: "Spielset", featKey: "skilled", equipment: "Feine Kleidung, Siegelring, 29 GS", gold: 29 },
  { name: "Gelehrter", abilities: ["constitution", "intelligence", "wisdom"], skills: ["Arkane Kunde", "Geschichte"], tool: "Kalligraphie-Werkzeug", featKey: "magic_initiate", equipment: "Buch, Tintenfass, Pergament, 8 GS", gold: 8 },
  { name: "Seefahrer", abilities: ["strength", "dexterity", "wisdom"], skills: ["Akrobatik", "Wahrnehmung"], tool: "Navigationswerkzeug", featKey: "tavern_brawler", equipment: "Dolch, Seil, Entdeckerausrüstung, 20 GS", gold: 20 },
  { name: "Schreiber", abilities: ["dexterity", "intelligence", "wisdom"], skills: ["Nachforschung", "Wahrnehmung"], tool: "Kalligraphie-Werkzeug", featKey: "skilled", equipment: "Feder-Set, Lampe, Pergament, 23 GS", gold: 23 },
  { name: "Soldat", abilities: ["strength", "dexterity", "constitution"], skills: ["Athletik", "Einschüchtern"], tool: "Spielset", featKey: "savage_attacker", equipment: "Speer, kurze Armbrust, Entdeckerausrüstung, 14 GS", gold: 14 },
  { name: "Wayfarer", abilities: ["dexterity", "wisdom", "charisma"], skills: ["Menschenkenntnis", "Heimlichkeit"], tool: "Diebeswerkzeug", featKey: "lucky", equipment: "2 Dolche, Diebeswerkzeug, Reisekleidung, 16 GS", gold: 16 },
];

// ============================================================
// INVENTAR
// Gewichte (in Pfund, wie im offiziellen Regelwerk) für die gängigsten
// Ausrüstungsgegenstände, damit die Traglast automatisch stimmt.
// ============================================================

export const ITEM_WEIGHTS: Record<string, number> = {
  "großaxt": 7,
  "wurfspeer": 2,
  "handaxt": 2,
  "kettenhemd": 20,
  "schild": 6,
  "holzschild": 6,
  "langschwert": 3,
  "lederrüstung": 10,
  "langbogen": 2,
  "kurzschwert": 2,
  "kettenrüstung": 55,
  "streitkolben": 4,
  "kriegshammer": 2,
  "rapier": 2,
  "dolch": 1,
  "diebeswerkzeug": 1,
  "kurzbogen": 2,
  "schuppenpanzer": 45,
  "krummsäbel": 3,
  "zauberbuch": 3,
  "kampfstab": 4,
  "leichte armbrust": 5,
  "kurze armbrust": 5,
  "arkaner fokus": 1,
  "speer": 3,
  "entdeckerausrüstung": 40,
  "diplomatenausrüstung": 20,
  "unterhalterausrüstung": 38,
  "gelehrtenausrüstung": 11,
  "zauberkomponentenbeutel": 2,
  "musikinstrument": 3,
  "wurfspeere": 2,
  "handäxte": 2,
  "kalligraphie-werkzeug": 5,
  "fälscherwerkzeug": 5,
  "zimmermannswerkzeug": 8,
  "kartografenwerkzeug": 6,
  "kräuterkunde-set": 3,
  "navigationswerkzeug": 2,
  "spielset": 0,
  "verkleidungsset": 3,
  "gebetsbuch": 1,
  "räucherstäbchen": 0,
  "talisman": 0,
  "gewand": 4,
  "kostüme": 4,
  "feine kleidung": 6,
  "brecheisen": 5,
  "sichel": 2,
  "ochsenkarren": 0,
  "steigeisen": 0,
  "zelt": 20,
  "decke": 3,
  "lampe": 1,
  "waage": 3,
  "siegelring": 0,
  "buch": 5,
  "tintenfass": 0,
  "pergament": 0,
  "seil": 10,
  "feder-set": 0,
  "reisekleidung": 4,
  "naturwerkzeug": 5,
};

// Offizielle Traglast-Formel: Stärke-Attribut × 15 Pfund
export function carryingCapacity(strengthScore: number) {
  return strengthScore * 15;
}

// ============================================================
// MONSTER-VORLAGEN
// Eine große, direkt einsatzbereite Auswahl gängiger Gegner für
// typische Kampagnen - HP, Waffe und Loot-Vorschlag, frei anpassbar
// beim Anlegen eines NPC-Pins. Kein Ersatz für das komplette
// Monster-Handbuch, aber eine solide Grundlage für die meisten Situationen.
// ============================================================

export interface MonsterTemplate {
  name: string;
  hp: number;
  ac: number;
  weapons: { name: string; damage: string }[];
  loot: string;
}

export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  { name: "Goblin", hp: 7, ac: 15, weapons: [{ name: "Krummsäbel", damage: "1W6" }, { name: "Kurzbogen", damage: "1W6" }], loot: "5 KS, kleiner Dolch" },
  { name: "Kobold", hp: 5, ac: 12, weapons: [{ name: "Dolch", damage: "1W4" }, { name: "Schleuder", damage: "1W4" }], loot: "3 KS, Schrottschmuck" },
  { name: "Ork", hp: 15, ac: 13, weapons: [{ name: "Großaxt", damage: "1W12" }, { name: "Wurfspeer", damage: "1W6" }], loot: "Grobe Rüstungsteile, 8 SS" },
  { name: "Hobgoblin", hp: 11, ac: 18, weapons: [{ name: "Langschwert", damage: "1W8" }, { name: "Langbogen", damage: "1W8" }], loot: "Militärabzeichen, 10 SS" },
  { name: "Gnoll", hp: 22, ac: 15, weapons: [{ name: "Speer", damage: "1W6" }, { name: "Kurzbogen", damage: "1W6" }], loot: "Blutiger Knochenschmuck" },
  { name: "Bandit", hp: 11, ac: 12, weapons: [{ name: "Krummsäbel", damage: "1W6" }, { name: "Leichte Armbrust", damage: "1W8" }], loot: "12 SS, gestohlene Ware" },
  { name: "Kultist", hp: 9, ac: 12, weapons: [{ name: "Dolch", damage: "1W4" }], loot: "Ritualdolch, dunkles Amulett" },
  { name: "Skelett", hp: 13, ac: 13, weapons: [{ name: "Kurzschwert", damage: "1W6" }, { name: "Kurzbogen", damage: "1W6" }], loot: "Verrostete Knochen, 2 KS" },
  { name: "Zombie", hp: 22, ac: 8, weapons: [{ name: "Fauststoß", damage: "1W6" }], loot: "Verweste Habseligkeiten" },
  { name: "Ghul", hp: 22, ac: 12, weapons: [{ name: "Kralle", damage: "2W4" }], loot: "Grabbeigaben" },
  { name: "Wiedergänger (Wight)", hp: 45, ac: 14, weapons: [{ name: "Langschwert", damage: "1W8" }, { name: "Langbogen", damage: "1W8" }], loot: "Alte Rüstung, Silberring" },
  { name: "Riesenspinne", hp: 26, ac: 14, weapons: [{ name: "Biss", damage: "1W8" }], loot: "Spinnenseide, Giftdrüse" },
  { name: "Riesenratte", hp: 7, ac: 12, weapons: [{ name: "Biss", damage: "1W3" }], loot: "Nichts Brauchbares" },
  { name: "Wolf", hp: 11, ac: 13, weapons: [{ name: "Biss", damage: "2W4" }], loot: "Wolfsfell" },
  { name: "Schreckenswolf (Dire Wolf)", hp: 37, ac: 14, weapons: [{ name: "Biss", damage: "2W6" }], loot: "Großes Fell, Reißzähne" },
  { name: "Schwarzbär", hp: 19, ac: 11, weapons: [{ name: "Biss", damage: "1W6" }, { name: "Kralle", damage: "1W6" }], loot: "Bärenfell, Klauen" },
  { name: "Krokodil", hp: 19, ac: 12, weapons: [{ name: "Biss", damage: "1W10" }], loot: "Lederhaut" },
  { name: "Riesenskorpion", hp: 52, ac: 15, weapons: [{ name: "Schere", damage: "1W8" }, { name: "Stachel", damage: "1W6" }], loot: "Giftstachel" },
  { name: "Riesentausendfüßler", hp: 4, ac: 13, weapons: [{ name: "Biss", damage: "1W4" }], loot: "Giftdrüse" },
  { name: "Harpyie", hp: 38, ac: 11, weapons: [{ name: "Kralle", damage: "2W4" }], loot: "Federn, glänzender Tand" },
  { name: "Oger", hp: 59, ac: 11, weapons: [{ name: "Großkeule", damage: "2W8" }, { name: "Wurfspeer", damage: "2W6" }], loot: "Grobe Beute, 2W6 GS" },
  { name: "Bugbär", hp: 27, ac: 16, weapons: [{ name: "Morgenstern", damage: "2W8" }, { name: "Wurfspeer", damage: "1W6" }], loot: "Diebesgut, 15 SS" },
  { name: "Minotaurus", hp: 76, ac: 14, weapons: [{ name: "Großaxt", damage: "2W12" }, { name: "Stoßangriff", damage: "2W8" }], loot: "Labyrinth-Karte, Hornschmuck" },
  { name: "Eulenbär (Owlbear)", hp: 59, ac: 13, weapons: [{ name: "Kralle", damage: "1W10" }, { name: "Schnabel", damage: "1W10" }], loot: "Federn, Klauen" },
  { name: "Troll", hp: 84, ac: 15, weapons: [{ name: "Kralle", damage: "2W6" }, { name: "Biss", damage: "1W6" }], loot: "Regenerierendes Trollblut" },
  { name: "Animierte Rüstung", hp: 33, ac: 18, weapons: [{ name: "Fauststoß", damage: "1W6" }], loot: "Die Rüstung selbst" },
  { name: "Gallertwürfel", hp: 84, ac: 6, weapons: [{ name: "Pseudopod", damage: "3W6" }], loot: "Halbverdaute Gegenstände" },
  { name: "Mimic", hp: 58, ac: 12, weapons: [{ name: "Biss", damage: "1W8" }, { name: "Pseudopod", damage: "1W8" }], loot: "Der Schatz, den er vortäuscht" },
  { name: "Irrlicht (Will-o'-Wisp)", hp: 22, ac: 19, weapons: [{ name: "Schockschlag", damage: "2W8" }], loot: "Nichts Materielles" },
  { name: "Vampirspross", hp: 82, ac: 15, weapons: [{ name: "Kralle", damage: "1W8" }, { name: "Biss", damage: "1W6" }], loot: "Feines, dunkles Gewand" },
  { name: "Banshee", hp: 58, ac: 12, weapons: [{ name: "Zermürbende Berührung", damage: "3W6" }], loot: "Zerrissener Brautschleier" },
  { name: "Fluchgeist (Wraith)", hp: 67, ac: 13, weapons: [{ name: "Lebensentzug", damage: "4W8" }], loot: "Kalte, dunkle Asche" },
  { name: "Klabautergeist (Specter)", hp: 22, ac: 12, weapons: [{ name: "Lebensentzug", damage: "3W6" }], loot: "Nichts Materielles" },
  { name: "Imp", hp: 10, ac: 13, weapons: [{ name: "Stachel", damage: "1W4" }, { name: "Biss", damage: "1W4" }], loot: "Kleines Höllenrelikt" },
  { name: "Quasit", hp: 7, ac: 13, weapons: [{ name: "Kralle", damage: "1W4" }, { name: "Biss", damage: "1W4" }], loot: "Verdrehtes Amulett" },
];

function lookupWeight(name: string): number {
  const lower = name.toLowerCase();
  for (const key of Object.keys(ITEM_WEIGHTS)) {
    if (lower.includes(key)) return ITEM_WEIGHTS[key];
  }
  return 1; // unbekannte Gegenstände: 1 Pfund als Schätzung
}

// Schadenswürfel, Schadensart und Waffenkategorie der gängigsten Waffen,
// nach offizieller Waffentabelle. Die Kategorie bestimmt, welcher
// Kampfstil-Bonus (falls gewählt) zur Waffe passt.
export type WeaponCategory = "melee-one" | "melee-two" | "ranged";

export interface WeaponInfo {
  dice: string;
  category: WeaponCategory;
}

export const WEAPON_DAMAGE: Record<string, WeaponInfo> = {
  "großaxt": { dice: "1W12 Hieb", category: "melee-two" },
  "wurfspeer": { dice: "1W6 Stich", category: "melee-one" },
  "wurfspeere": { dice: "1W6 Stich", category: "melee-one" },
  "handaxt": { dice: "1W6 Hieb", category: "melee-one" },
  "handäxte": { dice: "1W6 Hieb", category: "melee-one" },
  "langschwert": { dice: "1W8 Hieb", category: "melee-one" },
  "kurzschwert": { dice: "1W6 Stich", category: "melee-one" },
  "streitkolben": { dice: "1W6 Wucht", category: "melee-one" },
  "kriegshammer": { dice: "1W8 Wucht (1W10 zweihändig)", category: "melee-one" },
  "rapier": { dice: "1W8 Stich", category: "melee-one" },
  "dolch": { dice: "1W4 Stich", category: "melee-one" },
  "dolche": { dice: "1W4 Stich", category: "melee-one" },
  "kurzbogen": { dice: "1W6 Stich", category: "ranged" },
  "langbogen": { dice: "1W8 Stich", category: "ranged" },
  "krummsäbel": { dice: "1W6 Hieb", category: "melee-one" },
  "kampfstab": { dice: "1W6 Wucht (1W8 zweihändig)", category: "melee-one" },
  "leichte armbrust": { dice: "1W8 Stich", category: "ranged" },
  "kurze armbrust": { dice: "1W6 Stich", category: "ranged" },
  "speer": { dice: "1W6 Stich (1W8 zweihändig)", category: "melee-one" },
};

// Ermittelt Schadenswürfel + evtl. Klassen-/Kampfstil-Bonus für eine Waffe.
// oneHandedWeaponCount: wie viele einhändige Waffen die Ausrüstung enthält
// (Duellieren gilt nur, wenn du KEINE zweite Waffe in der anderen Hand hast)
export function weaponDisplay(
  name: string,
  charClass: CharClass,
  fightingStyle: string | null,
  oneHandedWeaponCount: number
): string | null {
  const lower = name.toLowerCase();
  let info: WeaponInfo | null = null;
  for (const key of Object.keys(WEAPON_DAMAGE)) {
    if (lower.includes(key)) {
      info = WEAPON_DAMAGE[key];
      break;
    }
  }
  if (!info) return null;

  let bonus = "";
  if (fightingStyle === "Duellieren" && info.category === "melee-one" && oneHandedWeaponCount <= 1) {
    bonus = " · +2 Schaden (Duellieren)";
  } else if (fightingStyle === "Bogenschütze" && info.category === "ranged") {
    bonus = " · +2 Trefferwurf (Bogenschütze)";
  } else if (fightingStyle === "Zweihandkampf" && info.category === "melee-two") {
    bonus = " · 1er/2er beim Schaden neu würfeln (Zweihandkampf)";
  } else if (charClass === "Barbar" && (info.category === "melee-one" || info.category === "melee-two")) {
    bonus = " · +2 Schaden, solange du wütend bist (Wut)";
  } else if (charClass === "Schurke" && (info.category === "melee-one" || info.category === "ranged")) {
    bonus = " · +1W6 Schaden 1×/Zug bei Vorteil (Hinterhältiger Angriff)";
  }
  return info.dice + bonus;
}

export interface InventoryItem {
  name: string;
  qty: number;
  weight: number; // Gewicht pro Stück in Pfund
  damage?: string; // Schadenswürfel, falls es eine Waffe ist
}

function lookupBaseDamage(name: string): string | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(WEAPON_DAMAGE)) {
    if (lower.includes(key)) return WEAPON_DAMAGE[key].dice;
  }
  return null;
}

// Wandelt eine Komma-Liste wie "2 Dolche, Diebeswerkzeug, 16 GS" in
// strukturierte Inventar-Einträge um (Gold wird herausgefiltert).
export function parseEquipmentString(text: string): InventoryItem[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+\s*GS$/i.test(s))
    .map((entry) => {
      const match = entry.match(/^(\d+)\s+(.+)$/);
      const qty = match ? parseInt(match[1], 10) : 1;
      const name = match ? match[2] : entry;
      const damage = lookupBaseDamage(name);
      return {
        name,
        qty,
        weight: lookupWeight(name),
        ...(damage ? { damage } : {}),
      };
    });
}
