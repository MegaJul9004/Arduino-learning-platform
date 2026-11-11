import type { Lesson, PathType } from '@/types/curriculum';
import { WIRING_LESSONS } from './wiring';
import { CODE_LESSONS } from './code';

export const LESSONS: Lesson[] = [...WIRING_LESSONS, ...CODE_LESSONS];
export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonsForPath = (p: PathType) => (p === 'wiring' ? WIRING_LESSONS : CODE_LESSONS);
export const PATH_META: Record<PathType, { title: string; subtitle: string }> = {
  wiring: { title: 'Pfad A · Elektronik & Verkabelung', subtitle: 'Pin-Belegung, Sensoren, Shield v2.4, Stromversorgung' },
  code: { title: 'Pfad B · C/C++ Programmierung', subtitle: 'Von setup()/loop() bis zu Timer-Interrupts' },
};

/** Lektion n ist freigeschaltet, wenn n-1 des gleichen Pfads abgeschlossen ist. */
export function isUnlocked(lesson: Lesson, completed: Record<string, { completedAt?: string }>): boolean {
  if (lesson.order === 1) return true;
  const prev = lessonsForPath(lesson.path).find((l) => l.order === lesson.order - 1);
  return !prev || !!completed[prev.id]?.completedAt;
}
