import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress } from '@/types/curriculum';

export const XP_PER_LEVEL = 100;
export const levelForXp = (xp: number) => 1 + Math.floor(xp / XP_PER_LEVEL);

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dayKey(new Date());
const yesterday = () => dayKey(new Date(Date.now() - 86_400_000));

/** Streak ist nur gültig, wenn heute oder gestern gelernt wurde. */
export function effectiveStreak(p: Pick<UserProgress, 'streak' | 'lastActiveDate'>): number {
  return p.lastActiveDate === today() || p.lastActiveDate === yesterday() ? p.streak : 0;
}

export interface CompletionResult {
  gainedXp: number;
  stars: number;
  leveledUp: boolean;
  level: number;
  streak: number;
  firstTime: boolean;
}

interface ProgressStore extends UserProgress {
  completeLesson: (lessonId: string, xp: number, stars: number) => CompletionResult;
  resetProgress: () => void;
}

const initial: UserProgress = { xp: 0, level: 1, streak: 0, lessons: {} };

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initial,
      completeLesson: (lessonId, xp, stars) => {
        const s = get();
        const prev = s.lessons[lessonId];
        const firstTime = !prev?.completedAt;
        // Wiederholung: nur 25 % XP, damit Farmen nicht lohnt
        const gainedXp = firstTime ? xp : Math.round(xp * 0.25);
        const newXp = s.xp + gainedXp;
        const level = levelForXp(newXp);
        let streak = s.streak;
        if (s.lastActiveDate !== today()) streak = s.lastActiveDate === yesterday() ? s.streak + 1 : 1;
        set({
          xp: newXp,
          level,
          streak,
          lastActiveDate: today(),
          lessons: {
            ...s.lessons,
            [lessonId]: {
              completedSteps: prev?.completedSteps ?? [],
              stars: Math.max(prev?.stars ?? 0, stars),
              completedAt: prev?.completedAt ?? new Date().toISOString(),
            },
          },
        });
        return { gainedXp, stars, leveledUp: level > s.level, level, streak, firstTime };
      },
      resetProgress: () => set({ ...initial }),
    }),
    { name: 'arduino-lab-progress' },
  ),
);
