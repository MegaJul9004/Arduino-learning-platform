import type { PinConnectionRule } from './circuit';

export type PathType = 'wiring' | 'code';

export type StepKind = 'theory' | 'wiring' | 'code' | 'hybrid' | 'quiz' | 'tips';

/** Regelbasierte Code-Prüfung (Regex/AST – Auswertung folgt in Phase 4). */
export interface CodeValidationRule {
  id: string;
  description: string;
  /** Regex-Quelltext, der im (kommentarbereinigten) Code vorkommen muss. */
  pattern: string;
  flags?: string;
  /** true = darf NICHT vorkommen */
  forbidden?: boolean;
  hint?: string;
  /** Verknüpfung zur 3D-Szene: Arduino-Pin, der zusätzlich beschaltet sein muss. */
  requiresWiredPin?: string;
}

export interface Step {
  id: string;
  kind: StepKind;
  title: string;
  /** Markdown-Inhalt (Theorie bzw. Aufgabenstellung). */
  content: string;
  xp: number;
  wiringRules?: PinConnectionRule[];
  codeRules?: CodeValidationRule[];
  starterCode?: string;
}

export interface ProTip {
  title: string;
  body: string;
}

export interface Lesson {
  id: string;
  path: PathType;
  /** Position im Pfad (1-basiert) */
  order: number;
  title: string;
  summary: string;
  steps: Step[];
  /** Meilenstein-Lektion → Truhe + Profi-Tipps */
  milestone?: boolean;
  proTips?: ProTip[];
  requires?: string[];
}

export interface LessonProgress {
  completedSteps: string[];
  /** 0–3 Sterne */
  stars: number;
  completedAt?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  lessons: Record<string, LessonProgress>;
}
