import type { CodeValidationRule } from '@/types/curriculum';

export interface LintIssue {
  line: number; // 1-basiert
  col: number; // 1-basiert
  endCol: number;
  severity: 'error' | 'warning';
  message: string;
}

export interface CodeRuleResult {
  rule: CodeValidationRule;
  passed: boolean;
  reason?: string;
}

/** Entfernt Kommentare, behält Zeilenumbrüche/Spalten bei (Ersatz durch Leerzeichen). String-Literale bleiben erhalten. */
export function stripComments(code: string): string {
  let out = '';
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    const n = code[i + 1];
    if (c === '/' && n === '/') {
      while (i < code.length && code[i] !== '\n') (out += ' ', i++);
    } else if (c === '/' && n === '*') {
      out += '  ';
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) (out += code[i] === '\n' ? '\n' : ' ', i++);
      if (i < code.length) (out += '  ', (i += 2));
    } else if (c === '"' || c === "'") {
      out += c;
      i++;
      while (i < code.length && code[i] !== c && code[i] !== '\n') {
        if (code[i] === '\\' && i + 1 < code.length) (out += code[i], i++);
        out += code[i];
        i++;
      }
      if (i < code.length && code[i] === c) (out += c, i++);
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Ersetzt Inhalte von String-/Char-Literalen durch Leerzeichen (für Klammerprüfung). */
function blankStrings(s: string): string {
  return s.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, (m) => '"' + ' '.repeat(Math.max(0, m.length - 2)) + '"');
}

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

/** Heuristischer Arduino-Linter: Klammern, setup()/loop(), fehlende Semikolons. */
export function lintArduino(code: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const stripped = stripComments(code);
  const lines = blankStrings(stripped).split('\n');

  // Klammerbalance
  const stack: { ch: string; line: number; col: number }[] = [];
  lines.forEach((text, li) => {
    for (let ci = 0; ci < text.length; ci++) {
      const ch = text[ci];
      if ('([{'.includes(ch)) stack.push({ ch, line: li + 1, col: ci + 1 });
      else if (ch in PAIRS) {
        const top = stack.pop();
        if (!top || top.ch !== PAIRS[ch]) {
          issues.push({ line: li + 1, col: ci + 1, endCol: ci + 2, severity: 'error', message: `Unerwartetes '${ch}' – keine passende öffnende Klammer.` });
          if (top) stack.push(top);
        }
      }
    }
  });
  for (const o of stack) {
    issues.push({ line: o.line, col: o.col, endCol: o.col + 1, severity: 'error', message: `'${o.ch}' wird nie geschlossen.` });
  }

  // Pflichtfunktionen
  if (!/\bvoid\s+setup\s*\(\s*(void)?\s*\)/.test(stripped)) {
    issues.push({ line: 1, col: 1, endCol: 2, severity: 'error', message: 'Es fehlt `void setup()` – jeder Sketch braucht diese Funktion.' });
  }
  if (!/\bvoid\s+loop\s*\(\s*(void)?\s*\)/.test(stripped)) {
    issues.push({ line: 1, col: 1, endCol: 2, severity: 'error', message: 'Es fehlt `void loop()` – jeder Sketch braucht diese Funktion.' });
  }

  // Fehlendes Semikolon bei typischen Einzelaufrufen
  const call = /^\s*(pinMode|digitalWrite|analogWrite|delay|delayMicroseconds|attachInterrupt|Serial\.\w+|\w+\.(?:attach|write|begin))\s*\(.*\)\s*$/;
  lines.forEach((text, li) => {
    if (call.test(text) && !/[;{}]\s*$/.test(text)) {
      issues.push({ line: li + 1, col: text.trimEnd().length + 1, endCol: text.trimEnd().length + 2, severity: 'warning', message: 'Fehlt hier ein Semikolon `;`?' });
    }
  });

  // Häufiger Anfängerfehler: '=' statt '==' in if
  lines.forEach((text, li) => {
    const m = /\bif\s*\(\s*[\w\[\]]+\s*=\s*[^=]/.exec(text);
    if (m) issues.push({ line: li + 1, col: m.index + 1, endCol: m.index + m[0].length + 1, severity: 'warning', message: "In einer Bedingung vergleichst du mit '==' – '=' ist eine Zuweisung." });
  });

  return issues;
}

/** Prüft Code gegen regelbasierte Anforderungen (RegEx auf kommentarbereinigtem Code). */
export function validateCodeRules(code: string, rules: CodeValidationRule[], wiredPins: Set<string>): CodeRuleResult[] {
  const stripped = stripComments(code);
  return rules.map((rule) => {
    let found: boolean;
    try {
      found = new RegExp(rule.pattern, rule.flags ?? '').test(stripped);
    } catch {
      return { rule, passed: false, reason: 'Interner Fehler: ungültiges Regelmuster.' };
    }
    if (rule.forbidden) {
      return found ? { rule, passed: false, reason: rule.hint ?? 'Dieses Konstrukt ist in dieser Aufgabe nicht erlaubt.' } : { rule, passed: true };
    }
    if (!found) return { rule, passed: false, reason: rule.hint ?? 'Im Code fehlt noch etwas.' };
    if (rule.requiresWiredPin && !wiredPins.has(rule.requiresWiredPin)) {
      return { rule, passed: false, reason: `Der Code ist ok – aber in der 3D-Szene ist Pin ${rule.requiresWiredPin} noch nicht verkabelt.` };
    }
    return { rule, passed: true };
  });
}
