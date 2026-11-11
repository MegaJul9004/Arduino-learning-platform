import type { Step } from '@/types/curriculum';
import type { Wire } from '@/types/circuit';
import { evaluateRules, wiredPinIds } from '@/lib/circuit';
import { lintArduino, validateCodeRules, type LintIssue } from '@/lib/codeValidator';

export interface CheckItem {
  id: string;
  label: string;
  ok: boolean;
  /** konstruktive Fehlermeldung */
  hint?: string;
  source: 'wiring' | 'code';
}

export interface StepCheck {
  passed: boolean;
  items: CheckItem[];
  lint: LintIssue[];
}

/** Gemeinsame Prüfung für Verkabelung, Code und Hybrid-Schritte. */
export function checkStep(step: Step, code: string, wires: Wire[]): StepCheck {
  const items: CheckItem[] = [];
  for (const r of evaluateRules(step.wiringRules ?? [], wires)) {
    items.push({ id: r.rule.id, label: r.rule.description, ok: r.satisfied, hint: r.satisfied ? undefined : r.rule.hint ?? 'Prüfe die Verkabelung.', source: 'wiring' });
  }
  const isCode = step.kind === 'code' || step.kind === 'hybrid';
  let lint: LintIssue[] = [];
  if (isCode) {
    lint = lintArduino(code);
    for (const r of validateCodeRules(code, step.codeRules ?? [], wiredPinIds(wires))) {
      items.push({ id: r.rule.id, label: r.rule.description, ok: r.passed, hint: r.reason, source: 'code' });
    }
  }
  const lintErrors = lint.filter((l) => l.severity === 'error');
  return { passed: items.every((i) => i.ok) && lintErrors.length === 0, items, lint };
}
