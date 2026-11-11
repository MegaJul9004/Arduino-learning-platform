import { Cable, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PathType } from '@/types/curriculum';
import { useProgressStore } from '@/store/progressStore';
import { lessonsForPath, PATH_META } from '@/data/curriculum';
import { Header } from './Header';

export function Dashboard({ onSelect }: { onSelect: (p: PathType) => void }) {
  const lessons = useProgressStore((s) => s.lessons);
  const reset = useProgressStore((s) => s.resetProgress);
  const icons = { wiring: Cable, code: Code2 } as const;

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-6 p-6">
        <div>
          <h1 className="text-3xl font-extrabold">Willkommen im Arduino Lab</h1>
          <p className="mt-1 text-slate-400">Lerne den Arduino MEGA mit Sensor Shield v2.4 – in zwei parallelen Pfaden.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(['wiring', 'code'] as PathType[]).map((p) => {
            const list = lessonsForPath(p);
            const done = list.filter((l) => lessons[l.id]?.completedAt).length;
            const Icon = icons[p];
            return (
              <motion.button
                key={p}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(p)}
                className="rounded-2xl border-2 border-slate-700 bg-slate-900 p-6 text-left hover:border-emerald-500"
              >
                <Icon className="mb-3 h-10 w-10 text-emerald-400" />
                <h3 className="text-lg font-bold">{PATH_META[p].title}</h3>
                <p className="mt-1 text-sm text-slate-400">{PATH_META[p].subtitle}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(done / list.length) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{done} / {list.length} Lektionen</p>
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={() => window.confirm('Gesamten Lernfortschritt zurücksetzen?') && reset()}
          className="self-start text-xs text-slate-500 hover:text-red-400"
        >
          Fortschritt zurücksetzen
        </button>
      </main>
    </div>
  );
}
