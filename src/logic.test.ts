import { describe, expect, it } from 'vitest';
import { LESSONS } from '@/data/curriculum';
import { checkStep } from '@/lib/stepCheck';
import { checkConnection, evaluateRules } from '@/lib/circuit';
import { lintArduino, stripComments } from '@/lib/codeValidator';
import { ALL_PINS, PIN_BY_ID } from '@/data/megaPins';
import type { Wire } from '@/types/circuit';

const W = (pairs: [string, string][]): Wire[] => pairs.map(([from, to], i) => ({ id: String(i), from, to, color: '#fff' }));

const wiring: Record<string, [string, string][]> = {
  w01: [['D13', 'LED1_A'], ['LED1_K', 'GND_P1']],
  w02: [['BTN1_1', 'D2'], ['BTN1_2', 'GND_R1']],
  w03: [['POT1_VCC', '5V_R1'], ['POT1_GND', 'GND_T'], ['POT1_SIG', 'A0']],
  w04: [['BUZ1_P', 'D9'], ['BUZ1_N', 'GND_T']],
  w05: [['SERVO1_SIG', 'D9'], ['SERVO1_VCC', '5V_P'], ['SERVO1_GND', 'GND_T']],
  w06: [['US_VCC', '5V_P'], ['US_GND', 'GND_T'], ['US_TRIG', 'D7'], ['US_ECHO', 'D6']],
  w07: [['BTN1_1', 'D18'], ['BTN1_2', 'GND_T']],
  w08: [['LCD_SDA', 'D20'], ['LCD_SCL', 'D21'], ['LCD_VCC', '5V_P'], ['LCD_GND', 'GND_T']],
  w09: [['SD_MISO', 'D50'], ['SD_MOSI', 'D51'], ['SD_SCK', 'D52'], ['SD_CS', 'D53'], ['SD_VCC', '5V_P'], ['SD_GND', 'GND_T']],
  w10: [['SERVO1_VCC', 'EXT_5V'], ['SERVO1_GND', 'EXT_GND'], ['EXT_GND', 'GND_T'], ['SERVO1_SIG', 'D9']],
};

const code: Record<string, { code: string; wires?: [string, string][] }> = {
  c01: { code: `const int ledPin = 13;
unsigned long previousMillis = 0;
const unsigned long interval = 500;
bool ledState = false;
void setup() { pinMode(ledPin, OUTPUT); }
void loop() {
  if (millis() - previousMillis >= interval) {
    previousMillis = millis();
    ledState = !ledState;
    digitalWrite(ledPin, ledState);
  }
}` },
  c02: { code: `const int buttonPin = 2; const int ledPin = 13;
void setup() { pinMode(buttonPin, INPUT_PULLUP); pinMode(ledPin, OUTPUT); }
void loop() { if (digitalRead(buttonPin) == LOW) { digitalWrite(ledPin, HIGH); } else { digitalWrite(ledPin, LOW); } }` },
  c03: { code: `void setup() { pinMode(9, OUTPUT); }
void loop() { int v = analogRead(A0); analogWrite(9, map(v, 0, 1023, 0, 255)); }` },
  c04: { code: `void setup() { Serial.begin(9600); }
void loop() { int value = analogRead(A0); Serial.println(value); delay(100); }` },
  c05: { code: `int ledPins[] = {22, 23, 24, 25};
void setup() { for (int i = 0; i < 4; i++) { pinMode(ledPins[i], OUTPUT); } }
void allOn() { for (int i = 0; i < 4; i++) { digitalWrite(ledPins[i], HIGH); } }
void loop() { allOn(); }` },
  c06: { wires: [['BTN1_1', 'D18'], ['BTN1_2', 'GND_T']], code: `volatile bool pressed = false;
void onPress() { pressed = true; }
void setup() { pinMode(18, INPUT_PULLUP); attachInterrupt(digitalPinToInterrupt(18), onPress, FALLING); }
void loop() { if (pressed) { pressed = false; } }` },
  c07: { wires: [['SERVO1_SIG', 'D9'], ['SERVO1_VCC', '5V_P'], ['SERVO1_GND', 'GND_T']], code: `#include <Servo.h>
Servo myServo;
void setup() { myServo.attach(9); }
void loop() { myServo.write(90); }` },
  c08: { code: `class Led {
 public:
  Led(int p) : pin(p) { pinMode(pin, OUTPUT); }
  void on() { digitalWrite(pin, HIGH); }
  void off() { digitalWrite(pin, LOW); }
 private:
  int pin;
};
Led led(13);
void setup() {}
void loop() { led.on(); delay(500); led.off(); delay(500); }` },
  c09: { code: `void setup() { DDRB |= (1 << DDB7); }
void loop() { PORTB ^= (1 << PORTB7); delay(500); }` },
  c10: { code: `enum State { OFF, ON, BLINK };
volatile State state = OFF;
void setup() {
  pinMode(13, OUTPUT);
  noInterrupts();
  TCCR1A = 0; TCCR1B = 0;
  OCR1A = 15624;
  TCCR1B |= (1 << WGM12) | (1 << CS12) | (1 << CS10);
  TIMSK1 |= (1 << OCIE1A);
  interrupts();
}
ISR(TIMER1_COMPA_vect) { state = (state == OFF) ? ON : OFF; }
void loop() { switch (state) { case ON: digitalWrite(13, HIGH); break; default: digitalWrite(13, LOW); break; } }` },
};

describe('Curriculum', () => {
  it('hat 10 + 10 Lektionen mit eindeutigen IDs', () => {
    expect(LESSONS.filter((l) => l.path === 'wiring')).toHaveLength(10);
    expect(LESSONS.filter((l) => l.path === 'code')).toHaveLength(10);
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(20);
  });

  it('alle Regeln referenzieren existierende Pins', () => {
    for (const l of LESSONS) for (const s of l.steps) for (const r of s.wiringRules ?? []) {
      expect(PIN_BY_ID.has(r.a), `${l.id}:${r.a}`).toBe(true);
      expect(PIN_BY_ID.has(r.b), `${l.id}:${r.b}`).toBe(true);
    }
    for (const l of LESSONS) for (const s of l.steps) for (const r of s.codeRules ?? []) {
      if (r.requiresWiredPin) expect(PIN_BY_ID.has(r.requiresWiredPin)).toBe(true);
      expect(() => new RegExp(r.pattern, r.flags)).not.toThrow();
    }
  });

  it('Pin-IDs sind eindeutig', () => {
    expect(new Set(ALL_PINS.map((p) => p.id)).size).toBe(ALL_PINS.length);
  });

  for (const l of LESSONS) {
    const step = l.steps.find((s) => s.kind !== 'theory')!;
    it(`${l.id}: Musterlösung besteht`, () => {
      const sol = code[l.id];
      const wires = W(wiring[l.id] ?? sol?.wires ?? []);
      const res = checkStep(step, sol?.code ?? '', wires);
      expect(res.items.filter((i) => !i.ok), JSON.stringify(res.items.filter((i) => !i.ok))).toEqual([]);
      expect(res.lint.filter((x) => x.severity === 'error')).toEqual([]);
      expect(res.passed).toBe(true);
    });
    it(`${l.id}: Startzustand besteht NICHT`, () => {
      const res = checkStep(step, step.starterCode ?? '', []);
      expect(res.passed).toBe(false);
    });
  }
});

describe('Schaltungslogik', () => {
  it('lehnt Kurzschluss 5V↔GND ab', () => {
    expect(checkConnection('5V_P', 'GND_T', []).ok).toBe(false);
    expect(checkConnection('5V_P', '3V3', []).ok).toBe(false);
  });
  it('erkennt indirekten Kurzschluss', () => {
    const w = W([['D13', 'LED1_A'], ['LED1_A', 'GND_T']]);
    expect(checkConnection('D13', '5V_P', w).ok).toBe(false);
  });
  it('erkennt indirekten Kurzschluss über interne GND-Verbindung', () => {
    expect(checkConnection('LED1_A', 'GND_R1', W([['LED1_A', '5V_P']])).ok).toBe(false);
  });
  it('lehnt Duplikate und gleichen Pin ab', () => {
    expect(checkConnection('D2', 'D2', []).ok).toBe(false);
    expect(checkConnection('D2', 'D3', W([['D3', 'D2']])).ok).toBe(false);
  });
  it('externes Netzteil hat getrennte Schiene', () => {
    expect(checkConnection('EXT_5V', 'GND_T', []).ok).toBe(false);
    expect(checkConnection('EXT_GND', 'GND_T', []).ok).toBe(true);
    expect(checkConnection('EXT_5V', '5V_P', []).ok).toBe(true);
  });
  it('forbidden-Regel', () => {
    const rule = { id: 'x', a: 'SERVO1_VCC', b: '5V_P', description: '', forbidden: true };
    expect(evaluateRules([rule], []) [0].satisfied).toBe(true);
    expect(evaluateRules([rule], W([['SERVO1_VCC', '5V_R2']]))[0].satisfied).toBe(false);
  });
});

describe('Code-Prüfer', () => {
  it('entfernt Kommentare, behält Strings', () => {
    const s = stripComments('a // x\nb /* y\nz */ c "//no"');
    expect(s).not.toContain('x');
    expect(s).not.toContain('y');
    expect(s).toContain('"//no"');
    expect(s.split('\n')).toHaveLength(3);
  });
  it('Kommentierte Aufrufe zählen nicht', () => {
    const step = LESSONS.find((l) => l.id === 'c09')!.steps[1];
    const res = checkStep(step, 'void setup(){} void loop(){ // DDRB |= 1<<2;\n}', []);
    expect(res.passed).toBe(false);
  });
  it('Linter: Klammern und Semikolon', () => {
    expect(lintArduino('void setup() { void loop() {}').some((i) => i.severity === 'error')).toBe(true);
    expect(lintArduino('void setup() {\n pinMode(13, OUTPUT)\n}\nvoid loop() {}').some((i) => i.message.includes('Semikolon'))).toBe(true);
    expect(lintArduino('void loop() {}').some((i) => i.message.includes('setup'))).toBe(true);
    expect(lintArduino('void setup(){ Serial.println("(") ; }\nvoid loop(){}').filter((i) => i.severity === 'error')).toEqual([]);
  });
  it('Hybrid: Code ok aber Pin unverkabelt → fail', () => {
    const l = LESSONS.find((x) => x.id === 'c07')!.steps[1];
    const res = checkStep(l, code.c07.code, []);
    expect(res.items.find((i) => i.id === 'c')!.ok).toBe(false);
  });
});
