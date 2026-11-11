import { ArrowLeft, Check, Gift, Lock, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Lesson, PathType } from '@/types/curriculum';
import { useProgressStore } from '@/store/progressStore';
import { isUnlocked, lessonsForPath, PATH_META } from '@/data/curriculum';
import { sfx } from '@/lib/sound';
import { Header } from './Header';

const OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60];

function Stars({ n }: { n: number }) {
  return (
    <div className="mt-1 flex justify-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
      ))}
    </div>
  );
}

export function PathView({ path, onOpen, onBack }: { path: PathType; onOpen: (l: Lesson) => void; onBack: () => void }) {
  const progress = useProgressStore((s) => s.lessons);
  const lessons = lessonsForPath(path);
  const firstOpen = lessons.find((l) => isUnlocked(l, progress) && !progress[l.id]?.completedAt);

  return (
    <div className="flex h-full flex-col">
      <Header onHome={onBack} />
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <button onClick={onBack} aria-label="Zurück" className="text-slate-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <h2 className="font-bold">{PATH_META[path].title}</h2>
          <p className="text-xs text-slate-400">{PATH_META[path].subtitle}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-8">
        <ol className="mx-auto flex max-w-md flex-col items-center gap-8">
          {lessons.map((l, i) => {
            const done = !!progress[l.id]?.completedAt;
            const unlocked = isUnlocked(l, progress);
            const current = firstOpen?.id === l.id;
            const color = done ? 'bg-emerald-500 border-emerald-700' : current ? 'bg-sky-500 border-sky-700' : l.milestone && unlocked ? 'bg-yellow-500 border-yellow-700' : unlocked ? 'bg-slate-600 border-slate-800' : 'bg-slate-800 border-slate-900';
            return (
              <li key={l.id} style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }} className="flex flex-col items-center text-center">
                <motion.button
                  disabled={!unlocked}
                  whileHover={unlocked ? { scale: 1.08 } : undefined}
                  whileTap={unlocked ? { scale: 0.94, y: 4 } : undefined}
                  animate={current ? { scale: [1, 1.08, 1] } : undefined}
                  transition={current ? { repeat: Infinity, duration: 1.6 } : undefined}
                  onClick={() => { sfx.click(); onOpen(l); }}
                  aria-label={`Lektion ${l.order}: ${l.title}${unlocked ? '' : ' (gesperrt)'}`}
                  className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-8 text-white shadow-lg disabled:cursor-not-allowed ${color}`}
                >
                  {!unlocked ? <Lock className="h-7 w-7 text-slate-500" /> : done ? <Check className="h-8 w-8" /> : l.milestone ? <Gift className="h-8 w-8" /> : current ? <Play className="h-8 w-8" /> : <span className="text-xl font-bold">{l.order}</span>}
                </motion.button>
                {done && <Stars n={progress[l.id].stars} />}
                <p className={`mt-2 max-w-[200px] text-sm font-semibold ${unlocked ? 'text-slate-100' : 'text-slate-500'}`}>{l.title}</p>
                {l.milestone && <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Meilenstein</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
