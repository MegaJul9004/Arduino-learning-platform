import type { CodeValidationRule, Lesson } from '@/types/curriculum';
import type { PinConnectionRule } from '@/types/circuit';

const c = (id: string, description: string, pattern: string, hint: string, extra: Partial<CodeValidationRule> = {}): CodeValidationRule => ({
  id, description, pattern, hint, ...extra,
});
const w = (id: string, a: string, b: string, description: string, hint: string): PinConnectionRule => ({ id, a, b, description, hint });
const R = String.raw;

/** Pfad B – C/C++ Programmierung (10 Stufen). */
export const CODE_LESSONS: Lesson[] = [
  {
    id: 'c01', path: 'code', order: 1, title: 'Variablen & Blink ohne delay()',
    summary: 'Nicht-blockierendes Blinken mit millis().',
    steps: [
      { id: 'c01-t', kind: 'theory', title: 'Theorie: setup, loop, Variablen', xp: 0,
        content: "Jeder Sketch hat `setup()` (läuft einmal) und `loop()` (läuft endlos).\n\n`delay()` blockiert den Prozessor. Besser: `millis()` liefert die Zeit seit Start; du merkst dir den letzten Umschaltzeitpunkt in einer Variable und vergleichst.\n\n`unsigned long` ist der richtige Typ für Zeitwerte, `const` schützt vor versehentlichem Ändern." },
      { id: 'c01-a', kind: 'code', title: 'Aufgabe: Blink ohne delay', xp: 15,
        content: "Konfiguriere `ledPin` als **OUTPUT** und schalte die LED alle 500 ms mit `millis()` um. **`delay()` ist verboten.**",
        starterCode: `// Blink ohne delay()
const int ledPin = 13;
unsigned long previousMillis = 0;
const unsigned long interval = 500;
bool ledState = false;

void setup() {
  // TODO: ledPin als OUTPUT konfigurieren
}

void loop() {
  // TODO: millis() mit previousMillis vergleichen und LED umschalten
}
`,
        codeRules: [
          c('a', 'pinMode(ledPin, OUTPUT) in setup()', R`pinMode\s*\(\s*(ledPin|13|LED_BUILTIN)\s*,\s*OUTPUT\s*\)`, 'Nutze pinMode(ledPin, OUTPUT); in setup().'),
          c('b', 'Zeitvergleich mit millis()', R`millis\s*\(\s*\)`, 'Rufe millis() auf und vergleiche mit previousMillis.'),
          c('c', 'LED mit digitalWrite() setzen', R`digitalWrite\s*\(\s*(ledPin|13|LED_BUILTIN)\s*,`, 'Setze die LED mit digitalWrite(ledPin, ledState);'),
          c('d', 'Kein delay() verwenden', R`\bdelay\s*\(`, 'Entferne delay() – es blockiert das Programm.', { forbidden: true }),
        ] },
    ],
    proTips: [{ title: 'Überlauf ist harmlos', body: 'millis() läuft nach ~49 Tagen über. Die Subtraktion `jetzt - zuletzt` mit unsigned long funktioniert trotzdem korrekt.' }],
  },
  {
    id: 'c02', path: 'code', order: 2, title: 'Digitale Eingänge: Taster lesen',
    summary: 'INPUT_PULLUP und digitalRead().',
    steps: [
      { id: 'c02-t', kind: 'theory', title: 'Theorie: Eingänge', xp: 0,
        content: "`pinMode(pin, INPUT_PULLUP)` aktiviert den internen Pull-up. Der Taster zieht den Pin beim Drücken auf **LOW**.\n\n`digitalRead(pin)` liefert `HIGH` oder `LOW`. Beachte die **invertierte Logik**: gedrückt = LOW." },
      { id: 'c02-a', kind: 'code', title: 'Aufgabe: LED per Taster', xp: 15,
        content: "Der Taster hängt an **D2**, die LED an **D13**. Die LED soll leuchten, solange der Taster gedrückt ist.",
        starterCode: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  // TODO: buttonPin mit Pull-up, ledPin als Ausgang
}

void loop() {
  // TODO: Taster lesen und LED entsprechend setzen
}
`,
        codeRules: [
          c('a', 'Taster mit INPUT_PULLUP', R`pinMode\s*\(\s*\w+\s*,\s*INPUT_PULLUP\s*\)`, 'Konfiguriere den Taster-Pin mit INPUT_PULLUP.'),
          c('b', 'LED als OUTPUT', R`pinMode\s*\(\s*\w+\s*,\s*OUTPUT\s*\)`, 'Konfiguriere die LED als OUTPUT.'),
          c('c', 'Taster mit digitalRead() lesen', R`digitalRead\s*\(`, 'Lies den Taster mit digitalRead(buttonPin).'),
          c('d', 'Entscheidung mit if oder Ausdruck', R`\bif\s*\(|digitalWrite\s*\([^)]*digitalRead`, 'Verwende if (...) oder übergib das Leseergebnis direkt.'),
          c('e', 'LED mit digitalWrite() schalten', R`digitalWrite\s*\(`, 'Schalte die LED mit digitalWrite().'),
        ] },
    ],
    proTips: [{ title: 'Flankenerkennung', body: 'Speichere den letzten Tasterzustand, um nur die Änderung (Flanke) auszuwerten – nicht jeden Durchlauf.' }],
  },
  {
    id: 'c03', path: 'code', order: 3, title: 'Analog lesen & PWM',
    summary: 'Poti → Helligkeit mit map().',
    steps: [
      { id: 'c03-t', kind: 'theory', title: 'Theorie: ADC & PWM', xp: 0,
        content: "`analogRead(A0)` liefert **0–1023** (10 Bit). `analogWrite(pin, 0–255)` gibt ein PWM-Signal aus.\n\n`map(wert, 0, 1023, 0, 255)` rechnet zwischen den Bereichen um." },
      { id: 'c03-a', kind: 'code', title: 'Aufgabe: LED dimmen', xp: 20,
        content: "Lies das Poti an **A0** und dimme die LED an **D9** (PWM) mit `map()`.",
        starterCode: `const int potPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // TODO: Poti lesen, auf 0-255 abbilden, per PWM ausgeben
}
`,
        codeRules: [
          c('a', 'analogRead(A0)', R`analogRead\s*\(\s*(A0|potPin)\s*\)`, 'Lies das Poti mit analogRead(A0).'),
          c('b', 'Wert mit map() skalieren', R`\bmap\s*\(\s*[^,]+,\s*0\s*,\s*1023\s*,\s*0\s*,\s*255\s*\)`, 'Nutze map(wert, 0, 1023, 0, 255).'),
          c('c', 'PWM mit analogWrite()', R`analogWrite\s*\(`, 'Gib den Wert mit analogWrite(ledPin, helligkeit) aus.'),
        ] },
    ],
    proTips: [{ title: 'Rauschen glätten', body: 'Mittle mehrere analogRead()-Werte (z. B. 8), um Rauschen zu reduzieren.' }],
  },
  {
    id: 'c04', path: 'code', order: 4, title: 'Serielle Kommunikation & Debugging',
    summary: 'Serial Monitor als Debug-Werkzeug.',
    steps: [
      { id: 'c04-t', kind: 'theory', title: 'Theorie: Serial', xp: 0,
        content: "`Serial.begin(9600);` startet die UART-Schnittstelle (Baudrate muss zum Serial Monitor passen). `Serial.println(x)` gibt Werte aus – dein wichtigstes Debug-Werkzeug.\n\nDer Mega hat **4 UARTs**: `Serial`, `Serial1`, `Serial2`, `Serial3`." },
      { id: 'c04-a', kind: 'code', title: 'Aufgabe: Messwerte ausgeben', xp: 20,
        content: "Starte Serial mit **9600 Baud** und gib den Wert von A0 einmal pro Durchlauf mit `Serial.println()` aus.",
        starterCode: `void setup() {
  // TODO: Serial starten
}

void loop() {
  int value = analogRead(A0);
  // TODO: value ausgeben
  delay(100);
}
`,
        codeRules: [
          c('a', 'Serial.begin(9600)', R`Serial\.begin\s*\(\s*9600\s*\)`, 'Rufe Serial.begin(9600); in setup() auf.'),
          c('b', 'Serial.println()', R`Serial\.println\s*\(\s*value\s*\)`, 'Gib die Variable value mit Serial.println(value); aus.'),
        ] },
    ],
    proTips: [{ title: 'Serial ist langsam', body: 'Zu viele Serial-Ausgaben verlangsamen dein Programm. Gib Werte in Intervallen aus (millis()).' }],
  },
  {
    id: 'c05', path: 'code', order: 5, title: 'Funktionen & Arrays', milestone: true,
    summary: 'Wiederverwendbarer Code und Datenfelder.',
    steps: [
      { id: 'c05-t', kind: 'theory', title: 'Theorie: Struktur', xp: 0,
        content: "**Funktionen** bündeln Logik: `void blinkAll() { ... }`. **Arrays** speichern mehrere Werte: `int leds[] = {22, 23, 24};`. Mit einer `for`-Schleife gehst du alle Elemente durch.\n\nDer Mega hat viele Pins (22–53) – Arrays sind ideal, um z. B. 8 LEDs anzusteuern." },
      { id: 'c05-a', kind: 'code', title: 'Aufgabe: LED-Leiste', xp: 30,
        content: "Definiere ein **Array** mit den Pins 22–25, konfiguriere sie in einer **for-Schleife** und schreibe eine **eigene Funktion**, die alle LEDs einschaltet.",
        starterCode: `// TODO: Array ledPins mit 22, 23, 24, 25

void setup() {
  // TODO: for-Schleife mit pinMode
}

// TODO: eigene Funktion allOn()

void loop() {
  // TODO: allOn() aufrufen
}
`,
        codeRules: [
          c('a', 'Array deklariert', R`\bint\s+\w+\s*\[\s*\w*\s*\]\s*=\s*\{[^}]+\}`, 'Beispiel: int ledPins[] = {22, 23, 24, 25};'),
          c('b', 'for-Schleife', R`\bfor\s*\(`, 'Nutze eine for-Schleife über das Array.'),
          c('c', 'Eigene Funktion definiert', R`\bvoid\s+(?!setup\b|loop\b)\w+\s*\([^)]*\)\s*\{`, 'Definiere z. B. void allOn() { ... }'),
          c('d', 'pinMode im Code', R`pinMode\s*\(`, 'Konfiguriere die Pins mit pinMode().'),
          c('e', 'digitalWrite im Code', R`digitalWrite\s*\(`, 'Schalte die LEDs mit digitalWrite().'),
        ] },
    ],
    proTips: [
      { title: 'sizeof statt Zahl', body: 'Berechne die Array-Länge mit sizeof(arr)/sizeof(arr[0]), statt sie hart zu kodieren.' },
      { title: 'Funktionen kurz halten', body: 'Eine Funktion = eine Aufgabe. Das macht Code testbar und lesbar.' },
      { title: 'Namenskonvention', body: 'Nutze sprechende Namen (ledPins statt a) und konsistente Schreibweise (camelCase).' },
    ],
  },
  {
    id: 'c06', path: 'code', order: 6, title: 'Externe Interrupts',
    summary: 'ISR, volatile und attachInterrupt (Hybrid mit 3D).',
    steps: [
      { id: 'c06-t', kind: 'theory', title: 'Theorie: Interrupts', xp: 0,
        content: "Ein **Interrupt** unterbricht `loop()` sofort, wenn ein Ereignis eintritt. Die **ISR** muss kurz sein, ohne `delay()` und ohne `Serial`.\n\nVariablen, die in der ISR geändert werden, müssen `volatile` sein.\n\n`attachInterrupt(digitalPinToInterrupt(18), isr, FALLING);`" },
      { id: 'c06-a', kind: 'hybrid', title: 'Aufgabe: Taster-Interrupt', xp: 35,
        content: "Schreibe Code mit Interrupt an **D18** (FALLING) und **verkabele zusätzlich in der 3D-Szene** den Taster zwischen D18 und GND.",
        starterCode: `volatile bool pressed = false;

// TODO: ISR schreiben, die pressed auf true setzt

void setup() {
  pinMode(18, INPUT_PULLUP);
  // TODO: attachInterrupt
}

void loop() {
  if (pressed) {
    pressed = false;
    // Hier könnte etwas passieren
  }
}
`,
        wiringRules: [
          w('w1', 'BTN1_1', 'D18', 'Taster 1 → D18 (3D)', 'Verbinde den Taster mit D18.'),
          w('w2', 'BTN1_2', 'GND_T', 'Taster 2 → GND (3D)', 'Der zweite Kontakt an GND.'),
        ],
        codeRules: [
          c('a', 'volatile-Variable', R`\bvolatile\s+\w+\s+\w+`, 'Markiere ISR-Variablen als volatile.'),
          c('b', 'attachInterrupt auf D18', R`attachInterrupt\s*\(\s*digitalPinToInterrupt\s*\(\s*18\s*\)\s*,\s*\w+\s*,\s*(FALLING|RISING|CHANGE|LOW)\s*\)`, 'Nutze attachInterrupt(digitalPinToInterrupt(18), isr, FALLING);', { requiresWiredPin: 'D18' }),
          c('c', 'ISR-Funktion definiert', R`\bvoid\s+(?!setup\b|loop\b)\w+\s*\(\s*(void)?\s*\)\s*\{`, 'Definiere eine parameterlose void-Funktion als ISR.'),
        ] },
    ],
    proTips: [{ title: 'ISR kurz halten', body: 'Setze nur ein Flag in der ISR und verarbeite es in loop(). Lange ISRs blockieren andere Interrupts.' }],
  },
  {
    id: 'c07', path: 'code', order: 7, title: 'Bibliotheken: Servo',
    summary: 'Library einbinden und Objekte nutzen (Hybrid).',
    steps: [
      { id: 'c07-t', kind: 'theory', title: 'Theorie: Libraries', xp: 0,
        content: "Bibliotheken kapseln komplexen Code. `#include <Servo.h>` bindet sie ein, `Servo myServo;` erzeugt ein Objekt, `myServo.attach(9);` verbindet es mit einem Pin, `myServo.write(90);` setzt den Winkel (0–180°)." },
      { id: 'c07-a', kind: 'hybrid', title: 'Aufgabe: Servo bewegen', xp: 35,
        content: "Steuere den Servo an **D9** an und verkabele ihn in der 3D-Szene (Signal D9, VCC 5V, GND).",
        starterCode: `// TODO: Servo-Bibliothek einbinden

// TODO: Servo-Objekt anlegen

void setup() {
  // TODO: Servo an Pin 9 anhängen
}

void loop() {
  // TODO: Servo auf 90 Grad stellen
}
`,
        wiringRules: [
          w('w1', 'SERVO1_SIG', 'D9', 'Servo Signal → D9 (3D)', 'Signal an D9.'),
          w('w2', 'SERVO1_VCC', '5V_P', 'Servo VCC → 5V (3D)', 'VCC an 5V.'),
          w('w3', 'SERVO1_GND', 'GND_T', 'Servo GND → GND (3D)', 'GND an Masse.'),
        ],
        codeRules: [
          c('a', '#include <Servo.h>', R`#include\s*<Servo\.h>`, 'Binde die Bibliothek mit #include <Servo.h> ein.'),
          c('b', 'Servo-Objekt', R`\bServo\s+\w+\s*;`, 'Lege ein Objekt an: Servo myServo;'),
          c('c', 'attach(9)', R`\.attach\s*\(\s*9\s*\)`, 'Hänge den Servo mit myServo.attach(9); an.', { requiresWiredPin: 'D9' }),
          c('d', 'write(...)', R`\.write\s*\(\s*\d+\s*\)`, 'Setze den Winkel mit myServo.write(90);'),
        ] },
    ],
    proTips: [{ title: 'Timer-Nutzung', body: 'Die Servo-Bibliothek nutzt Timer 5 des Mega (bis zu 48 Servos). PWM an einigen Pins kann dadurch beeinflusst werden.' }],
  },
  {
    id: 'c08', path: 'code', order: 8, title: 'Modulare Architektur: Klassen',
    summary: 'Eigene Klasse für eine LED.',
    steps: [
      { id: 'c08-t', kind: 'theory', title: 'Theorie: Klassen', xp: 0,
        content: "Eine **Klasse** bündelt Daten und Funktionen: Pin-Nummer + `on()`/`off()`. Der **Konstruktor** initialisiert das Objekt. Du kannst dann mehrere Instanzen anlegen: `Led led1(13); Led led2(12);`\n\nProfi-Projekte teilen Klassen in `.h`/`.cpp`-Dateien." },
      { id: 'c08-a', kind: 'code', title: 'Aufgabe: Led-Klasse', xp: 35,
        content: "Schreibe eine Klasse `Led` mit **public**-Methoden `on()` und `off()`, lege eine Instanz mit Pin 13 an und nutze sie.",
        starterCode: `// TODO: class Led { ... };

// TODO: Instanz anlegen

void setup() {
  // TODO: Pin konfigurieren (z. B. begin())
}

void loop() {
  // TODO: LED ein- und ausschalten
}
`,
        codeRules: [
          c('a', 'class Led definiert', R`\bclass\s+Led\b`, 'Beginne mit class Led { ... };'),
          c('b', 'public:-Bereich', R`\bpublic\s*:`, 'Methoden müssen unter public: stehen.'),
          c('c', 'Methoden on() und off()', R`void\s+on\s*\([^)]*\)[\s\S]*void\s+off\s*\([^)]*\)`, 'Definiere void on() und void off().'),
          c('d', 'Instanz mit Pin', R`\bLed\s+\w+\s*\(\s*\d+\s*\)\s*;`, 'Lege eine Instanz an: Led led(13);'),
          c('e', 'Instanz benutzt', R`\b\w+\s*\.\s*(on|off)\s*\(\s*\)`, 'Rufe led.on() bzw. led.off() auf.'),
        ] },
    ],
    proTips: [{ title: 'Header-Guards', body: 'In .h-Dateien immer #pragma once oder #ifndef-Guards verwenden, um Doppelt-Includes zu vermeiden.' }],
  },
  {
    id: 'c09', path: 'code', order: 9, title: 'Registerprogrammierung (Low-Level)',
    summary: 'Pin 13 direkt über DDRB/PORTB schalten.',
    steps: [
      { id: 'c09-t', kind: 'theory', title: 'Theorie: Direkter Portzugriff', xp: 0,
        content: "`digitalWrite()` ist bequem, aber langsam (~5 µs). Direkter **Registerzugriff** schaltet in 2 Taktzyklen.\n\nAm Mega ist **Pin 13 = PB7**. `DDRB |= (1 << DDB7);` setzt ihn als Ausgang, `PORTB ^= (1 << PORTB7);` toggelt ihn.\n\n`|=` setzt Bits, `&= ~` löscht Bits, `^=` toggelt Bits." },
      { id: 'c09-a', kind: 'code', title: 'Aufgabe: Blink per Register', xp: 40,
        content: "Lass Pin 13 per **DDRB/PORTB** blinken – ohne `pinMode()` und `digitalWrite()`.",
        starterCode: `void setup() {
  // TODO: PB7 (Pin 13) als Ausgang setzen
}

void loop() {
  // TODO: PB7 toggeln
  delay(500);
}
`,
        codeRules: [
          c('a', 'DDRB |= ... setzen', R`DDRB\s*\|=`, 'Setze die Richtung mit DDRB |= (1 << DDB7);'),
          c('b', 'PORTB schalten', R`PORTB\s*(\|=|\^=|&=)`, 'Schalte mit PORTB ^= (1 << PORTB7);'),
          c('c', 'Bitverschiebung <<', R`<<`, 'Nutze (1 << Bitnummer) als Maske.'),
          c('d', 'Kein pinMode/digitalWrite', R`\b(pinMode|digitalWrite)\s*\(`, 'Verzichte auf pinMode() und digitalWrite().', { forbidden: true }),
        ] },
    ],
    proTips: [{ title: 'Datenblatt lesen', body: 'Die Register-Bitnamen stehen im ATmega2560-Datenblatt. Die Arduino-Pin-Zuordnung findest du im Mega-Pinout.' }],
  },
  {
    id: 'c10', path: 'code', order: 10, title: 'Timer-Interrupts, Bitmanipulation & Zustandsautomaten', milestone: true,
    summary: 'Timer1-CTC, enum-Zustände und switch.',
    steps: [
      { id: 'c10-t', kind: 'theory', title: 'Theorie: Timer & FSM', xp: 0,
        content: "Timer1 im **CTC-Modus** löst exakt periodische Interrupts aus: `OCR1A` ist der Vergleichswert, `TCCR1B` konfiguriert Modus & Prescaler, `TIMSK1` aktiviert den Interrupt, die ISR heißt `ISR(TIMER1_COMPA_vect)`.\n\nEin **Zustandsautomat** (FSM) nutzt `enum` + `switch`, um Abläufe sauber zu strukturieren (z. B. AUS → AN → BLINKEN).\n\nBeispiel für 1 Hz bei 16 MHz, Prescaler 1024: `OCR1A = 15624;`" },
      { id: 'c10-a', kind: 'code', title: 'Aufgabe: Timer-gesteuerte FSM', xp: 60,
        content: "Konfiguriere Timer1 (CTC, `OCR1A`, Prescaler 1024, Interrupt aktivieren), schreibe die ISR `TIMER1_COMPA_vect`, die einen **enum-Zustand** weiterschaltet, und werte ihn in `loop()` per **switch** aus. Nutze Bit-Operationen (`|=`, `<<`).",
        starterCode: `enum State { OFF, ON, BLINK };
volatile State state = OFF;

void setup() {
  pinMode(13, OUTPUT);
  noInterrupts();
  // TODO: Timer1 CTC konfigurieren (TCCR1A, TCCR1B, OCR1A, TIMSK1)
  interrupts();
}

// TODO: ISR(TIMER1_COMPA_vect) – Zustand weiterschalten

void loop() {
  // TODO: switch (state) { ... }
}
`,
        codeRules: [
          c('a', 'OCR1A gesetzt', R`OCR1A\s*=`, 'Setze den Vergleichswert, z. B. OCR1A = 15624;'),
          c('b', 'TCCR1B konfiguriert (Bit-Operation)', R`TCCR1B\s*(\|=|=)[^;]*<<`, 'Setze CTC- und Prescaler-Bits: TCCR1B |= (1 << WGM12) | (1 << CS12) | (1 << CS10);'),
          c('c', 'Timer-Interrupt aktiviert', R`TIMSK1\s*(\|=|=)[^;]*<<\s*OCIE1A`, 'Aktiviere: TIMSK1 |= (1 << OCIE1A);'),
          c('d', 'ISR(TIMER1_COMPA_vect)', R`ISR\s*\(\s*TIMER1_COMPA_vect\s*\)`, 'Schreibe ISR(TIMER1_COMPA_vect) { ... }'),
          c('e', 'switch über den Zustand', R`switch\s*\(\s*state\s*\)`, 'Werte den Zustand mit switch (state) { case OFF: ... } aus.'),
          c('f', 'Zustand in ISR geändert', R`ISR\s*\([^)]*\)\s*\{[^}]*state\s*=`, 'Ändere state innerhalb der ISR.'),
        ] },
    ],
    proTips: [
      { title: 'Atomare Zugriffe', body: 'Mehrbyte-Variablen (int, long), die in ISR und loop() genutzt werden, nur mit noInterrupts()/interrupts() bzw. ATOMIC_BLOCK lesen.' },
      { title: 'Prescaler-Rechnung', body: 'f = F_CPU / (Prescaler · (OCR1A + 1)). Rechne vorher – nicht probieren.' },
      { title: 'FSM-Diagramm zuerst', body: 'Zeichne Zustände und Übergänge auf, bevor du Code schreibst. Das spart Debugging.' },
    ],
  },
];
