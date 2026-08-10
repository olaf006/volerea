// Offizielle D&D-5e-Referenzdaten (vereinfacht fürs schnelle Erstellen).
// Diese Datei ist die "Regelbuch"-Grundlage für das Charakterblatt.

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

export type ClassName = (typeof CLASSES)[number];

// Trefferwürfel pro Klasse (für die HP-Berechnung)
export const HIT_DICE: Record<ClassName, number> = {
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

// Die 18 offiziellen Fertigkeiten, mit zugehörigem Attribut und
// einer kurzen Erklärung, wofür man sie im Spiel benutzt.
export const SKILLS = [
  { name: "Akrobatik", ability: "Geschicklichkeit", use: "Balancieren, sich aus Stürzen oder Griffen befreien" },
  { name: "Arkane Kunde", ability: "Intelligenz", use: "Wissen über Magie, Zauber und magische Gegenstände" },
  { name: "Athletik", ability: "Stärke", use: "Klettern, Schwimmen, Ringen, Springen" },
  { name: "Auftreten", ability: "Charisma", use: "Publikum unterhalten – Musik, Tanz, Schauspiel, Erzählen" },
  { name: "Einschüchtern", ability: "Charisma", use: "Mit Drohungen oder Präsenz jemanden gefügig machen" },
  { name: "Einsicht", ability: "Weisheit", use: "Wahre Absichten erkennen, Lügen durchschauen" },
  { name: "Fingerfertigkeit", ability: "Geschicklichkeit", use: "Schlösser knacken, Taschendiebstahl, Fallen entschärfen" },
  { name: "Geschichte", ability: "Intelligenz", use: "Wissen über vergangene Ereignisse, Reiche, Kriege" },
  { name: "Heimlichkeit", ability: "Geschicklichkeit", use: "Sich verstecken, unbemerkt bewegen" },
  { name: "Medizin", ability: "Weisheit", use: "Verletzte stabilisieren, Krankheiten/Gifte einschätzen" },
  { name: "Nachforschung", ability: "Intelligenz", use: "Hinweise deuten, logisch Schlüsse ziehen" },
  { name: "Naturkunde", ability: "Intelligenz", use: "Wissen über Tiere, Pflanzen, Wetter, Gelände" },
  { name: "Religion", ability: "Intelligenz", use: "Wissen über Götter, Kulte, religiöse Riten" },
  { name: "Tierumgang", ability: "Weisheit", use: "Tiere beruhigen, ihre Absichten einschätzen" },
  { name: "Täuschung", ability: "Charisma", use: "Überzeugend lügen, eine falsche Identität vortäuschen" },
  { name: "Überlebenskunst", ability: "Weisheit", use: "Spuren lesen, Nahrung finden, sich orientieren" },
  { name: "Überzeugen", ability: "Charisma", use: "Jemanden ehrlich und höflich von etwas überzeugen" },
  { name: "Wahrnehmung", ability: "Weisheit", use: "Etwas bemerken – Geräusche, Verstecktes, Hinterhalte" },
] as const;

// Wie viele Fertigkeiten darf eine Klasse wählen, und aus welcher Liste?
// (Barden dürfen aus allen 18 wählen, alle anderen aus einer festen Auswahl.)
export const CLASS_SKILLS: Record<ClassName, { choose: number; from: string[] | "all" }> = {
  Barbar: { choose: 2, from: ["Tierumgang", "Einschüchtern", "Naturkunde", "Wahrnehmung", "Überlebenskunst"] },
  Barde: { choose: 3, from: "all" },
  Kleriker: { choose: 2, from: ["Geschichte", "Einsicht", "Medizin", "Überzeugen", "Religion"] },
  Druide: { choose: 2, from: ["Arkane Kunde", "Tierumgang", "Einsicht", "Medizin", "Naturkunde", "Wahrnehmung", "Religion", "Überlebenskunst"] },
  Krieger: { choose: 2, from: ["Akrobatik", "Tierumgang", "Athletik", "Geschichte", "Einsicht", "Einschüchtern", "Wahrnehmung", "Überlebenskunst"] },
  Mönch: { choose: 2, from: ["Akrobatik", "Athletik", "Geschichte", "Einsicht", "Religion", "Heimlichkeit"] },
  Paladin: { choose: 2, from: ["Athletik", "Einsicht", "Einschüchtern", "Medizin", "Überzeugen", "Religion"] },
  Waldläufer: { choose: 3, from: ["Tierumgang", "Athletik", "Einsicht", "Nachforschung", "Naturkunde", "Wahrnehmung", "Heimlichkeit", "Überlebenskunst"] },
  Schurke: { choose: 4, from: ["Akrobatik", "Athletik", "Täuschung", "Einsicht", "Einschüchtern", "Nachforschung", "Wahrnehmung", "Auftreten", "Überzeugen", "Fingerfertigkeit", "Heimlichkeit"] },
  Hexenmeister: { choose: 2, from: ["Arkane Kunde", "Täuschung", "Geschichte", "Einschüchtern", "Nachforschung", "Religion"] },
  Magier: { choose: 2, from: ["Arkane Kunde", "Geschichte", "Einsicht", "Nachforschung", "Medizin", "Religion"] },
  Zauberer: { choose: 2, from: ["Arkane Kunde", "Täuschung", "Einsicht", "Einschüchtern", "Überzeugen", "Religion"] },
};

// Standard-Startausrüstung pro Klasse, mit kurzer Erklärung, wofür jedes
// Teil im Spiel gut ist. Ist als Vorauswahl angehakt, kann aber
// abgewählt werden.
export const CLASS_EQUIPMENT: Record<ClassName, { item: string; use: string }[]> = {
  Barbar: [
    { item: "Großaxt", use: "Starke Nahkampfwaffe, viel Schaden pro Treffer" },
    { item: "4 Wurfspeere", use: "Für Angriffe auf Distanz" },
    { item: "Lederrüstung", use: "Leichter Schutz, behindert die Bewegung nicht" },
    { item: "Entdeckerausrüstung", use: "Seil, Fackeln, Rationen – fürs Überleben unterwegs" },
  ],
  Barde: [
    { item: "Rapier", use: "Leichte, präzise Nahkampfwaffe" },
    { item: "Laute", use: "Musikinstrument, auch als Zauberfokus nutzbar" },
    { item: "Lederrüstung", use: "Leichter Schutz" },
    { item: "Unterhaltungsausrüstung", use: "Für Auftritte und um Publikum zu beeindrucken" },
  ],
  Kleriker: [
    { item: "Streitkolben", use: "Einfache Nahkampfwaffe" },
    { item: "Kettenhemd", use: "Guter Rüstungsschutz" },
    { item: "Schild", use: "Zusätzlicher Schutz im Nahkampf" },
    { item: "Heiliges Symbol", use: "Nötig, um Zauber zu wirken" },
  ],
  Druide: [
    { item: "Sichel", use: "Naturverbundene Nahkampfwaffe" },
    { item: "Holzschild", use: "Schutz ohne Metall (wichtig für Druiden-Traditionen)" },
    { item: "Lederrüstung", use: "Leichter Schutz aus natürlichem Material" },
    { item: "Druidenfokus", use: "Nötig, um Zauber zu wirken (z.B. Mistelzweig)" },
  ],
  Krieger: [
    { item: "Kettenhemd", use: "Starker Rüstungsschutz" },
    { item: "Langschwert und Schild", use: "Ausgewogene Nahkampf-Kombination" },
    { item: "Ausrüstungspaket", use: "Grundausstattung fürs Abenteuer" },
  ],
  Mönch: [
    { item: "Kurzschwert", use: "Leichte Nahkampfwaffe, passt zum Kampfstil" },
    { item: "10 Wurfpfeile", use: "Für Angriffe auf Distanz" },
    { item: "Entdeckerausrüstung", use: "Grundausstattung – Mönche tragen keine Rüstung" },
  ],
  Paladin: [
    { item: "Kettenhemd", use: "Starker Rüstungsschutz" },
    { item: "Langschwert und Schild", use: "Klassische Nahkampf-Kombination" },
    { item: "Heiliges Symbol", use: "Nötig, um Zauber zu wirken" },
  ],
  Waldläufer: [
    { item: "Lederrüstung", use: "Leichter Schutz, gut für Beweglichkeit" },
    { item: "Zwei Kurzschwerter", use: "Für schnelle Doppelangriffe im Nahkampf" },
    { item: "Langbogen mit Pfeilen", use: "Starke Fernkampfoption" },
  ],
  Schurke: [
    { item: "Kurzschwert", use: "Leichte, schnelle Nahkampfwaffe" },
    { item: "Kurzbogen mit Pfeilen", use: "Fernkampfoption" },
    { item: "Lederrüstung", use: "Leichter, unauffälliger Schutz" },
    { item: "Diebeswerkzeug", use: "Nötig zum Schlösserknacken und Fallen entschärfen" },
  ],
  Hexenmeister: [
    { item: "Kurzstab", use: "Dient als Zauberfokus" },
    { item: "Leichte Armbrust mit Bolzen", use: "Fernkampfoption ohne Zauber" },
    { item: "Lederrüstung", use: "Leichter Schutz" },
  ],
  Magier: [
    { item: "Kurzstab", use: "Dient als Zauberfokus" },
    { item: "Zauberbuch", use: "Enthält alle bekannten Zauber – unverzichtbar" },
    { item: "Dolch", use: "Für den Notfall im Nahkampf" },
  ],
  Zauberer: [
    { item: "Dolch", use: "Einfache Nahkampf-Notlösung" },
    { item: "Arkane Komponententasche", use: "Dient als Zauberfokus" },
    { item: "Leichte Armbrust mit Bolzen", use: "Fernkampfoption ohne Zauber" },
  ],
};

// Zauberkundige Klassen – nur für diese wird der Zauber-Bereich angezeigt.
export const SPELLCASTER_INFO: Partial<
  Record<ClassName, { cantrips: number; level1: number; note: string }>
> = {
  Magier: { cantrips: 3, level1: 2, note: "Magier bereiten Zauber aus ihrem Zauberbuch vor." },
  Zauberer: { cantrips: 4, level1: 2, note: "Zauberer wirken Zauber aus angeborener Kraft." },
  Hexenmeister: { cantrips: 2, level1: 2, note: "Hexenmeister erhalten ihre Magie durch einen Pakt." },
  Kleriker: { cantrips: 3, level1: 2, note: "Kleriker bereiten Zauber durch ihren Glauben vor." },
  Druide: { cantrips: 2, level1: 2, note: "Druiden bereiten Zauber aus der Kraft der Natur vor." },
  Barde: { cantrips: 2, level1: 4, note: "Barden wirken Zauber durch Musik und Worte." },
};

// Kleine, handverlesene Auswahl an Zaubern pro Klasse (Zaubertricks und
// Grad 1), mit kurzer eigener Erklärung wann/wie man sie einsetzt.
export const SPELLS: Record<
  string,
  { cantrips: { name: string; use: string }[]; level1: { name: string; use: string }[] }
> = {
  Magier: {
    cantrips: [
      { name: "Feuerpfeil", use: "Kleiner Feuerschaden auf Distanz – guter Standardangriff" },
      { name: "Trick", use: "Kleine Illusionen oder Tricks, z.B. um abzulenken" },
      { name: "Licht", use: "Erschafft eine Lichtquelle" },
      { name: "Frostspeer", use: "Kälteschaden und verlangsamt das Ziel leicht" },
    ],
    level1: [
      { name: "Magisches Geschoss", use: "Trifft automatisch, guter verlässlicher Angriff" },
      { name: "Schild", use: "Reaktion, die kurzzeitig deine Rüstungsklasse erhöht" },
      { name: "Person betäuben", use: "Lähmt einen menschlichen Gegner zeitweise" },
      { name: "Identifizieren", use: "Findet heraus, was ein magischer Gegenstand kann" },
      { name: "Nebelwolke", use: "Erschafft dichten Nebel zum Verstecken oder Fliehen" },
      { name: "Schlaf", use: "Lässt schwächere Gegner in einem Bereich einschlafen" },
    ],
  },
  Zauberer: {
    cantrips: [
      { name: "Feuerpfeil", use: "Kleiner Feuerschaden auf Distanz" },
      { name: "Licht", use: "Erschafft eine Lichtquelle" },
      { name: "Trick", use: "Kleine Illusionen oder Tricks" },
      { name: "Frostspeer", use: "Kälteschaden, verlangsamt leicht" },
    ],
    level1: [
      { name: "Magisches Geschoss", use: "Trifft automatisch, verlässlicher Schaden" },
      { name: "Schild", use: "Erhöht kurzzeitig deine Rüstungsklasse" },
      { name: "Person betäuben", use: "Lähmt einen menschlichen Gegner" },
      { name: "Donnerwoge", use: "Stößt Gegner zurück und macht Lärm" },
    ],
  },
  Hexenmeister: {
    cantrips: [
      { name: "Klinge des Verderbens", use: "Magische Nahkampf-Klinge aus Energie" },
      { name: "Trick", use: "Kleine Illusionen oder Tricks" },
      { name: "Licht", use: "Erschafft eine Lichtquelle" },
    ],
    level1: [
      { name: "Höllischer Tadel", use: "Reaktion: Schaden austeilen, wenn du getroffen wirst" },
      { name: "Person bezaubern", use: "Macht ein Wesen dir gegenüber freundlich gesinnt" },
      { name: "Trugbild", use: "Erschafft eine täuschend echte Illusion" },
    ],
  },
  Kleriker: {
    cantrips: [
      { name: "Licht", use: "Erschafft eine Lichtquelle" },
      { name: "Führung", use: "Gibt einem Verbündeten einen kleinen Bonus auf eine Probe" },
      { name: "Heilige Flamme", use: "Radiant-Schaden auf einen Gegner" },
    ],
    level1: [
      { name: "Wunden heilen", use: "Stellt Lebenspunkte eines Verbündeten wieder her" },
      { name: "Segen", use: "Gibt bis zu drei Verbündeten Bonus auf Angriffe/Rettungswürfe" },
      { name: "Command", use: "Zwingt einen Gegner, ein einzelnes Wort zu befolgen" },
    ],
  },
  Druide: {
    cantrips: [
      { name: "Führung", use: "Gibt einem Verbündeten einen kleinen Bonus auf eine Probe" },
      { name: "Erzeuge Flamme", use: "Kleine Feuerquelle, auch für Schaden nutzbar" },
    ],
    level1: [
      { name: "Wunden heilen", use: "Stellt Lebenspunkte eines Verbündeten wieder her" },
      { name: "Donnerwelle", use: "Stößt Gegner um dich herum zurück" },
      { name: "Verstrickung", use: "Fesselt Gegner am Boden mit Pflanzen" },
    ],
  },
  Barde: {
    cantrips: [
      { name: "Trick", use: "Kleine Illusionen oder Tricks" },
      { name: "Führung", use: "Gibt einem Verbündeten einen kleinen Bonus auf eine Probe" },
    ],
    level1: [
      { name: "Heilendes Wort", use: "Heilt aus der Distanz, ohne Berührung nötig" },
      { name: "Person bezaubern", use: "Macht ein Wesen dir gegenüber freundlich gesinnt" },
      { name: "Schlaf", use: "Lässt schwächere Gegner in einem Bereich einschlafen" },
      { name: "Tarnung", use: "Macht ein Wesen unsichtbar" },
    ],
  },
};
