/** Arduino/C++ Autovervollständigung für Monaco. */
type Kind = 'fn' | 'const' | 'kw' | 'snip';
const E: [string, Kind, string, string][] = [
  ['pinMode', 'fn', 'pinMode(${1:pin}, ${2|OUTPUT,INPUT,INPUT_PULLUP|});', 'Konfiguriert einen Pin als Ein- oder Ausgang.'],
  ['digitalWrite', 'fn', 'digitalWrite(${1:pin}, ${2|HIGH,LOW|});', 'Setzt einen digitalen Ausgang auf HIGH oder LOW.'],
  ['digitalRead', 'fn', 'digitalRead(${1:pin})', 'Liest einen digitalen Eingang (HIGH/LOW).'],
  ['analogRead', 'fn', 'analogRead(${1:A0})', 'Liest einen Analogwert 0–1023.'],
  ['analogWrite', 'fn', 'analogWrite(${1:pin}, ${2:value});', 'PWM-Ausgabe 0–255 (nur PWM-Pins).'],
  ['analogReference', 'fn', 'analogReference(${1|DEFAULT,INTERNAL1V1,INTERNAL2V56,EXTERNAL|});', 'Referenzspannung des ADC.'],
  ['delay', 'fn', 'delay(${1:ms});', 'Blockierende Wartezeit in Millisekunden.'],
  ['delayMicroseconds', 'fn', 'delayMicroseconds(${1:us});', 'Blockierende Wartezeit in Mikrosekunden.'],
  ['millis', 'fn', 'millis()', 'Millisekunden seit Programmstart (unsigned long).'],
  ['micros', 'fn', 'micros()', 'Mikrosekunden seit Programmstart.'],
  ['map', 'fn', 'map(${1:value}, ${2:fromLow}, ${3:fromHigh}, ${4:toLow}, ${5:toHigh})', 'Skaliert einen Wert von einem Bereich in einen anderen.'],
  ['constrain', 'fn', 'constrain(${1:x}, ${2:a}, ${3:b})', 'Begrenzt x auf [a, b].'],
  ['attachInterrupt', 'fn', 'attachInterrupt(digitalPinToInterrupt(${1:pin}), ${2:isr}, ${3|FALLING,RISING,CHANGE,LOW|});', 'Registriert eine Interrupt-Service-Routine.'],
  ['detachInterrupt', 'fn', 'detachInterrupt(digitalPinToInterrupt(${1:pin}));', 'Entfernt einen Interrupt.'],
  ['digitalPinToInterrupt', 'fn', 'digitalPinToInterrupt(${1:pin})', 'Mega-Interruptpins: 2, 3, 18, 19, 20, 21.'],
  ['noInterrupts', 'fn', 'noInterrupts();', 'Deaktiviert alle Interrupts.'],
  ['interrupts', 'fn', 'interrupts();', 'Aktiviert Interrupts wieder.'],
  ['Serial.begin', 'fn', 'Serial.begin(${1:9600});', 'Startet die serielle Schnittstelle.'],
  ['Serial.print', 'fn', 'Serial.print(${1:value});', 'Gibt Daten seriell aus.'],
  ['Serial.println', 'fn', 'Serial.println(${1:value});', 'Gibt Daten mit Zeilenumbruch aus.'],
  ['Serial.available', 'fn', 'Serial.available()', 'Anzahl lesbarer Bytes.'],
  ['Serial.read', 'fn', 'Serial.read()', 'Liest ein Byte.'],
  ['tone', 'fn', 'tone(${1:pin}, ${2:frequency});', 'Erzeugt einen Rechteckton.'],
  ['noTone', 'fn', 'noTone(${1:pin});', 'Stoppt den Ton.'],
  ['pulseIn', 'fn', 'pulseIn(${1:pin}, ${2|HIGH,LOW|});', 'Misst Pulslänge in µs.'],
  ['bitRead', 'fn', 'bitRead(${1:x}, ${2:n})', 'Liest Bit n.'],
  ['bitSet', 'fn', 'bitSet(${1:x}, ${2:n});', 'Setzt Bit n.'],
  ['bitClear', 'fn', 'bitClear(${1:x}, ${2:n});', 'Löscht Bit n.'],
  ['HIGH', 'const', 'HIGH', 'Logisch 1 (5 V).'],
  ['LOW', 'const', 'LOW', 'Logisch 0 (0 V).'],
  ['INPUT', 'const', 'INPUT', 'Pin-Modus Eingang.'],
  ['OUTPUT', 'const', 'OUTPUT', 'Pin-Modus Ausgang.'],
  ['INPUT_PULLUP', 'const', 'INPUT_PULLUP', 'Eingang mit internem Pull-up.'],
  ['LED_BUILTIN', 'const', 'LED_BUILTIN', 'Onboard-LED (Pin 13).'],
  ['FALLING', 'const', 'FALLING', 'Interrupt bei fallender Flanke.'],
  ['RISING', 'const', 'RISING', 'Interrupt bei steigender Flanke.'],
  ['CHANGE', 'const', 'CHANGE', 'Interrupt bei jeder Flanke.'],
  ['volatile', 'kw', 'volatile ', 'Variable kann sich außerhalb des normalen Programmflusses ändern (ISR).'],
  ['const', 'kw', 'const ', 'Konstante.'],
  ['unsigned long', 'kw', 'unsigned long ', '32-Bit ohne Vorzeichen.'],
  ['uint8_t', 'kw', 'uint8_t ', '8-Bit ohne Vorzeichen.'],
  ['byte', 'kw', 'byte ', '8-Bit ohne Vorzeichen.'],
  ['DDRB', 'const', 'DDRB', 'Richtungsregister Port B (Pin 13 = PB7).'],
  ['PORTB', 'const', 'PORTB', 'Ausgaberegister Port B.'],
  ['PINB', 'const', 'PINB', 'Eingaberegister Port B.'],
  ['TCCR1A', 'const', 'TCCR1A', 'Timer1 Control Register A.'],
  ['TCCR1B', 'const', 'TCCR1B', 'Timer1 Control Register B.'],
  ['OCR1A', 'const', 'OCR1A', 'Timer1 Output Compare A.'],
  ['TIMSK1', 'const', 'TIMSK1', 'Timer1 Interrupt Mask.'],
  ['setup', 'snip', 'void setup() {\n\t$0\n}', 'setup()-Funktion'],
  ['loop', 'snip', 'void loop() {\n\t$0\n}', 'loop()-Funktion'],
  ['for', 'snip', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}', 'for-Schleife'],
  ['if', 'snip', 'if (${1:condition}) {\n\t$0\n}', 'if-Anweisung'],
  ['switch', 'snip', 'switch (${1:state}) {\n\tcase ${2:A}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}', 'switch-Anweisung'],
  ['ISR', 'snip', 'ISR(${1:TIMER1_COMPA_vect}) {\n\t$0\n}', 'Interrupt-Service-Routine (AVR)'],
  ['#include', 'snip', '#include <${1:Servo}.h>', 'Bibliothek einbinden'],
];

let registered = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerArduino(monaco: any) {
  if (registered) return;
  registered = true;
  const K = monaco.languages.CompletionItemKind;
  const kindMap: Record<Kind, number> = { fn: K.Function, const: K.Constant, kw: K.Keyword, snip: K.Snippet };
  monaco.languages.registerCompletionItemProvider('cpp', {
    provideCompletionItems(model: { getWordUntilPosition: (p: unknown) => { startColumn: number; endColumn: number } }, position: { lineNumber: number }) {
      const w = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: w.startColumn, endColumn: w.endColumn };
      return {
        suggestions: E.map(([label, kind, insertText, documentation]) => ({
          label,
          kind: kindMap[kind],
          insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation,
          range,
        })),
      };
    },
  });
}
