import type { PinConnectionRule } from '@/types/circuit';
import type { Lesson } from '@/types/curriculum';

const r = (id: string, a: string, b: string, description: string, hint?: string, forbidden = false): PinConnectionRule => ({
  id, a, b, description, hint, forbidden,
});

/** Pfad A – Elektronik & Verkabelung (10 Stufen). */
export const WIRING_LESSONS: Lesson[] = [
  {
    id: 'w01', path: 'wiring', order: 1, title: 'Erste LED am Shield',
    summary: 'Strompfad von D13 über die LED nach Masse.',
    steps: [
      { id: 'w01-t', kind: 'theory', title: 'Theorie: Der Stromkreis', xp: 0,
        content: "Strom fließt nur in einem **geschlossenen Kreis**: Signalpin → Bauteil → **GND**.\n\nEine LED ist eine Diode – sie leuchtet nur in einer Richtung. Der längere Draht ist die **Anode (+)**, der kürzere die **Kathode (−)**.\n\nAm Mega Shield v2.4 sind alle GND-Pins intern verbunden – du kannst also einen beliebigen GND-Pin wählen.\n\n**Ziel:** D13 → LED +, LED − → GND." },
      { id: 'w01-a', kind: 'wiring', title: 'Aufgabe: LED verkabeln', xp: 10,
        content: "Klicke zuerst auf den Start-Pin, dann auf den Ziel-Pin. Verbinde:\n- **D13** mit **LED +**\n- **LED −** mit einem **GND**-Pin",
        wiringRules: [
          r('a', 'D13', 'LED1_A', 'D13 → LED +', 'Das Signal kommt von D13 zur Anode (LED +).'),
          r('b', 'LED1_K', 'GND_T', 'LED − → GND', 'Die Kathode (LED −) gehört an Masse – ein beliebiger GND-Pin.'),
        ] },
    ],
    proTips: [{ title: 'Vorwiderstand nicht vergessen', body: "In echt gehört ein 220–330 Ω Widerstand in Reihe zur LED, sonst brennt sie durch (oder der Pin wird überlastet). Ein Mega-Pin liefert max. 20 mA dauerhaft." }],
  },
  {
    id: 'w02', path: 'wiring', order: 2, title: 'Taster & digitale Eingänge',
    summary: 'Taster mit Pull-up gegen Masse schalten.',
    steps: [
      { id: 'w02-t', kind: 'theory', title: 'Theorie: Pull-up', xp: 0,
        content: "Ein offener Eingang „schwebt“ und liefert Zufallswerte. Mit **INPUT_PULLUP** zieht ein interner Widerstand den Pin auf HIGH.\n\nDer Taster verbindet den Pin beim Drücken mit **GND** → LOW. Praktisch: Es ist keine externe Beschaltung nötig.\n\n**Ziel:** Taster zwischen **D2** und **GND**." },
      { id: 'w02-a', kind: 'wiring', title: 'Aufgabe: Taster anschließen', xp: 10,
        content: "Verbinde einen Taster-Kontakt mit **D2** und den anderen mit **GND**.",
        wiringRules: [
          r('a', 'BTN1_1', 'D2', 'Taster 1 → D2', 'Ein Taster-Kontakt gehört an den Eingangspin D2.'),
          r('b', 'BTN1_2', 'GND_T', 'Taster 2 → GND', 'Der zweite Kontakt gehört an Masse.'),
        ] },
    ],
    proTips: [{ title: 'Entprellen', body: "Mechanische Taster „prellen“ ca. 5–20 ms. Entprelle in Software (millis()) oder mit einem 100 nF Kondensator." }],
  },
  {
    id: 'w03', path: 'wiring', order: 3, title: 'Potentiometer & Analogeingänge',
    summary: 'Spannungsteiler an A0 anschließen.',
    steps: [
      { id: 'w03-t', kind: 'theory', title: 'Theorie: Spannungsteiler', xp: 0,
        content: "Ein Potentiometer ist ein einstellbarer **Spannungsteiler**: Außen liegen **5V** und **GND**, der Schleifer (Mitte) liefert 0–5 V.\n\nDer 10-Bit-ADC der Analogpins **A0–A15** wandelt das in Werte von 0–1023 um.\n\n**Ziel:** VCC → 5V, GND → GND, Signal → A0." },
      { id: 'w03-a', kind: 'wiring', title: 'Aufgabe: Poti verkabeln', xp: 15,
        content: "Verbinde alle drei Anschlüsse des Potentiometers.",
        wiringRules: [
          r('a', 'POT1_VCC', '5V_P', 'POT VCC → 5V', 'Ein Außenanschluss an 5V.'),
          r('b', 'POT1_GND', 'GND_T', 'POT GND → GND', 'Der andere Außenanschluss an GND.'),
          r('c', 'POT1_SIG', 'A0', 'POT Signal → A0', 'Der Schleifer (Signal) gehört an einen Analogeingang, hier A0.'),
        ] },
    ],
    proTips: [{ title: 'Nie 5V auf Digital-Pins', body: "Analogpins vertragen 0–5 V, aber niemals mehr als VCC. Bei 3,3-V-Sensoren die Referenz mit analogReference(EXTERNAL) anpassen." }],
  },
  {
    id: 'w04', path: 'wiring', order: 4, title: 'Piezo-Buzzer & PWM-Pins',
    summary: 'Töne erzeugen an einem PWM-fähigen Pin.',
    steps: [
      { id: 'w04-t', kind: 'theory', title: 'Theorie: PWM', xp: 0,
        content: "**PWM** (Pulsweitenmodulation) simuliert analoge Ausgaben durch schnelles Ein-/Ausschalten. Am Mega sind **2–13, 44–46** PWM-fähig (Hover über Pins zeigt die Fähigkeiten).\n\nEin passiver Piezo-Buzzer wird mit `tone()` angesteuert.\n\n**Ziel:** Buzzer + an **D9**, Buzzer − an GND." },
      { id: 'w04-a', kind: 'wiring', title: 'Aufgabe: Buzzer anschließen', xp: 15,
        content: "Buzzer **+** an **D9**, Buzzer **−** an **GND**.",
        wiringRules: [
          r('a', 'BUZ1_P', 'D9', 'Buzzer + → D9', 'D9 ist ein PWM-Pin – dorthin gehört das Signal.'),
          r('b', 'BUZ1_N', 'GND_T', 'Buzzer − → GND', 'Minus an Masse.'),
        ] },
    ],
    proTips: [{ title: 'Gemeinsamer Timer', body: "tone() blockiert PWM an manchen Pins, weil Pins sich Timer teilen. Plane Pins so, dass Timer-Konflikte vermieden werden." }],
  },
  {
    id: 'w05', path: 'wiring', order: 5, title: 'Servo: Signal, VCC, GND',
    summary: 'Dreipoliger Anschluss eines Servos.', milestone: true,
    steps: [
      { id: 'w05-t', kind: 'theory', title: 'Theorie: Servo-Anschluss', xp: 0,
        content: "Servos haben drei Leitungen: **Signal** (orange/gelb), **VCC** (rot) und **GND** (braun/schwarz). Das Sensor Shield v2.4 gruppiert Pins als **S-V-G** (Signal, Voltage, Ground) – deshalb passen Servos direkt.\n\n**Ziel:** Signal → **D9**, VCC → 5V, GND → GND." },
      { id: 'w05-a', kind: 'wiring', title: 'Aufgabe: Servo verkabeln', xp: 20,
        content: "Verbinde alle drei Servo-Leitungen.",
        wiringRules: [
          r('a', 'SERVO1_SIG', 'D9', 'Servo Signal → D9', 'Das Signal gehört an einen PWM-Pin, hier D9.'),
          r('b', 'SERVO1_VCC', '5V_P', 'Servo VCC → 5V', 'Rot an 5V.'),
          r('c', 'SERVO1_GND', 'GND_T', 'Servo GND → GND', 'Braun/Schwarz an GND.'),
        ] },
    ],
    proTips: [
      { title: 'Servo-Ruckeln', body: 'Ruckelt ein Servo oder resettet das Board, zieht er zu viel Strom vom USB-Port. Nutze ein externes Netzteil (siehe Stufe 10).' },
      { title: 'Farbcodierung', body: 'Rot = VCC, Schwarz/Braun = GND, Gelb/Orange/Weiß = Signal. Halte dich konsequent daran – es verhindert Verpolung.' },
      { title: 'Kabelfarben-Disziplin', body: 'Nutze in deinen Projekten immer gleiche Kabelfarben für VCC, GND und Signale. Troubleshooting wird dadurch massiv einfacher.' },
    ],
  },
  {
    id: 'w06', path: 'wiring', order: 6, title: 'Ultraschallsensor HC-SR04',
    summary: 'Vier Leitungen für Distanzmessung.',
    steps: [
      { id: 'w06-t', kind: 'theory', title: 'Theorie: Trigger & Echo', xp: 0,
        content: "Der HC-SR04 sendet bei einem **Trig**-Puls einen Ultraschall-Burst und meldet die Laufzeit über **Echo**. Er braucht **5V** und **GND**.\n\n**Ziel:** VCC → 5V, GND → GND, Trig → **D7**, Echo → **D6**." },
      { id: 'w06-a', kind: 'wiring', title: 'Aufgabe: HC-SR04 verkabeln', xp: 20,
        content: "Verbinde alle vier Pins des Sensors.",
        wiringRules: [
          r('a', 'US_VCC', '5V_P', 'VCC → 5V', 'Der Sensor braucht 5V.'),
          r('b', 'US_GND', 'GND_T', 'GND → GND', 'Masse nicht vergessen.'),
          r('c', 'US_TRIG', 'D7', 'Trig → D7', 'Trig ist ein Ausgang des Arduino – verbinde ihn mit D7.'),
          r('d', 'US_ECHO', 'D6', 'Echo → D6', 'Echo liefert das Messsignal an D6.'),
        ] },
    ],
    proTips: [{ title: 'Echo mit 3,3-V-Boards', body: 'Der Echo-Pin liefert 5 V. An 3,3-V-Mikrocontrollern (ESP32, Pi) brauchst du einen Spannungsteiler.' }],
  },
  {
    id: 'w07', path: 'wiring', order: 7, title: 'Interrupt-fähige Pins am Mega',
    summary: 'Taster an einem Hardware-Interrupt.',
    steps: [
      { id: 'w07-t', kind: 'theory', title: 'Theorie: Interrupt-Pins', xp: 0,
        content: "Der Mega hat **6 externe Interrupts**: Pins **2, 3, 18, 19, 20, 21**. Beim Uno sind es nur 2 und 3!\n\nPins 20/21 sind zugleich I²C – wähle für Taster daher 18 oder 19.\n\n**Ziel:** Taster zwischen **D18** und **GND**." },
      { id: 'w07-a', kind: 'wiring', title: 'Aufgabe: Interrupt-Taster', xp: 20,
        content: "Taster-Kontakt 1 an **D18**, Kontakt 2 an **GND**.",
        wiringRules: [
          r('a', 'BTN1_1', 'D18', 'Taster 1 → D18', 'D18 unterstützt Hardware-Interrupts.'),
          r('b', 'BTN1_2', 'GND_T', 'Taster 2 → GND', 'Der zweite Kontakt an Masse.'),
        ] },
    ],
    proTips: [{ title: 'Pin-Konflikte', body: 'D18/19 sind auch UART1 (TX1/RX1). Nutzt du Serial1, sind sie belegt.' }],
  },
  {
    id: 'w08', path: 'wiring', order: 8, title: 'I²C-Bus (SDA/SCL)',
    summary: 'Display am zweiadrigen Bus.',
    steps: [
      { id: 'w08-t', kind: 'theory', title: 'Theorie: I²C', xp: 0,
        content: "**I²C** braucht nur zwei Leitungen für viele Geräte: **SDA** (Daten) und **SCL** (Takt). Am Mega liegen sie fest auf **D20 (SDA)** und **D21 (SCL)** – nicht auf A4/A5 wie beim Uno!\n\nJedes Gerät hat eine Adresse; Pull-ups sind meist auf dem Modul.\n\n**Ziel:** Display SDA → D20, SCL → D21, VCC → 5V, GND → GND." },
      { id: 'w08-a', kind: 'wiring', title: 'Aufgabe: I²C-Display', xp: 25,
        content: "Verbinde alle vier Leitungen des LCD-Moduls.",
        wiringRules: [
          r('a', 'LCD_SDA', 'D20', 'SDA → D20', 'Am Mega ist SDA = D20.'),
          r('b', 'LCD_SCL', 'D21', 'SCL → D21', 'Am Mega ist SCL = D21.'),
          r('c', 'LCD_VCC', '5V_P', 'VCC → 5V', 'Versorgung 5V.'),
          r('d', 'LCD_GND', 'GND_T', 'GND → GND', 'Masse.'),
        ] },
    ],
    proTips: [{ title: 'Adressen scannen', body: 'Läuft das Display nicht, nutze einen I²C-Scanner-Sketch – die Adresse ist oft 0x27 oder 0x3F.' }],
  },
  {
    id: 'w09', path: 'wiring', order: 9, title: 'SPI-Bus (SD-Karte)',
    summary: 'Vier Signalleitungen am Hardware-SPI.',
    steps: [
      { id: 'w09-t', kind: 'theory', title: 'Theorie: SPI', xp: 0,
        content: "**SPI** nutzt vier Leitungen: **MOSI** (Master → Slave), **MISO** (Slave → Master), **SCK** (Takt) und **CS/SS** (Chip Select).\n\nAm Mega: **MISO = D50, MOSI = D51, SCK = D52, SS = D53** (nicht 11–13 wie beim Uno).\n\n**Ziel:** SD-Modul an die vier SPI-Pins + 5V + GND." },
      { id: 'w09-a', kind: 'wiring', title: 'Aufgabe: SD-Modul', xp: 25,
        content: "Verbinde alle sechs Anschlüsse des SD-Moduls.",
        wiringRules: [
          r('a', 'SD_MISO', 'D50', 'MISO → D50', 'MISO = D50 am Mega.'),
          r('b', 'SD_MOSI', 'D51', 'MOSI → D51', 'MOSI = D51 am Mega.'),
          r('c', 'SD_SCK', 'D52', 'SCK → D52', 'SCK = D52 am Mega.'),
          r('d', 'SD_CS', 'D53', 'CS → D53', 'Chip Select am Mega: D53.'),
          r('e', 'SD_VCC', '5V_P', 'VCC → 5V', 'Versorgung 5V.'),
          r('f', 'SD_GND', 'GND_T', 'GND → GND', 'Masse.'),
        ] },
    ],
    proTips: [{ title: 'Pin 53 immer Output', body: 'Auch wenn du CS auf einen anderen Pin legst: Pin 53 muss am Mega als OUTPUT konfiguriert sein, sonst arbeitet SPI als Slave.' }],
  },
  {
    id: 'w10', path: 'wiring', order: 10, title: 'Stromaufnahme-Management',
    summary: 'Servo über externes Netzteil mit gemeinsamer Masse.', milestone: true,
    steps: [
      { id: 'w10-t', kind: 'theory', title: 'Theorie: Strombudget', xp: 0,
        content: "USB liefert ca. **500 mA**, der 5V-Pin des Boards über den Regler meist weniger. Motoren und Servos ziehen schnell mehr (Anlaufstrom!).\n\n**Regel:** Lasten extern versorgen – aber **GND gemeinsam** verbinden, sonst fehlt dem Signal die Bezugsmasse. Die 5V des Netzteils dürfen **nie** mit den 5V des Boards verbunden werden.\n\n**Ziel:** Servo-VCC/GND an das externe Netzteil, Netzteil-GND mit Board-GND, Signal an D9." },
      { id: 'w10-a', kind: 'wiring', title: 'Aufgabe: Externe Versorgung', xp: 40,
        content: "- Servo VCC → **EXT 5V**\n- Servo GND → **EXT GND**\n- **EXT GND** → Board-**GND**\n- Servo Signal → **D9**\n- Servo VCC darf **nicht** am Board-5V hängen",
        wiringRules: [
          r('a', 'SERVO1_VCC', 'EXT_5V', 'Servo VCC → EXT 5V', 'Die Last gehört ans externe Netzteil.'),
          r('b', 'SERVO1_GND', 'EXT_GND', 'Servo GND → EXT GND', 'Servo-Masse an die Netzteil-Masse.'),
          r('c', 'EXT_GND', 'GND_T', 'EXT GND ↔ Board-GND (gemeinsame Masse)', 'Ohne gemeinsame Masse versteht der Servo das Signal nicht.'),
          r('d', 'SERVO1_SIG', 'D9', 'Servo Signal → D9', 'Das Signal kommt vom Arduino.'),
          r('e', 'SERVO1_VCC', '5V_P', 'Servo VCC NICHT am Board-5V', 'Entferne die Verbindung zwischen Servo VCC und Board-5V.', true),
        ] },
    ],
    proTips: [
      { title: 'Gemeinsame Masse', body: 'Alle Spannungsquellen eines Projekts brauchen eine gemeinsame Masse („Star Ground“).' },
      { title: 'Entkoppel-Kondensator', body: 'Ein 100–470 µF Elko parallel zur Servo-Versorgung glättet Stromspitzen.' },
      { title: 'Strombudget notieren', body: 'Addiere die Maximalströme aller Bauteile – und plane 30 % Reserve.' },
    ],
  },
];
