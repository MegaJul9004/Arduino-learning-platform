import { motion } from 'framer-motion';
import { Gift, Lightbulb, Star, Trophy } from 'lucide-react';
import type { ProTip } from '@/types/curriculum';
import type { CompletionResult } from '@/store/progressStore';

const backdrop = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4';

export function TipsOverlay({ tips, milestone, onContinue }: { tips: ProTip[]; milestone?: boolean; onContinue: () => void }) {
  return (
    <div className={backdrop} role="dialog" aria-label="Profi-Tipps">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg rounded-2xl border border-yellow-500/40 bg-slate-900 p-6">
        <div className="mb-4 flex items-center gap-2 text-yellow-400">
          {milestone ? <Gift className="h-6 w-6" /> : <Lightbulb className="h-6 w-6" />}
          <h3 className="text-lg font-bold">{milestone ? 'Meilenstein-Truhe: Profi-Tipps & Tricks' : 'Profi-Tipp'}</h3>
        </div>
        <ul className="space-y-3">
          {tips.map((t) => (
            <li key={t.title} className="rounded-lg bg-slate-800 p-3">
              <p className="font-semibold text-white">{t.title}</p>
              <p className="mt-1 text-sm text-slate-300">{t.body}</p>
            </li>
          ))}
        </ul>
        <button onClick={onContinue} className="mt-5 w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-400">
          Lektion abschließen
        </button>
      </motion.div>
    </div>
  );
}

export function CompleteOverlay({ result, milestone, onExit }: { result: CompletionResult; milestone?: boolean; onExit: () => void }) {
  return (
    <div className={backdrop} role="dialog" aria-label="Lektion abgeschlossen">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="w-full max-w-sm rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 text-center">
        <Trophy className="mx-auto h-14 w-14 text-yellow-400" />
        <h3 className="mt-2 text-2xl font-extrabold text-emerald-400">Lektion geschafft!</h3>
        <div className="my-3 flex justify-center gap-1">
          {[1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 * i }}>
              <Star className={`h-10 w-10 ${i <= result.stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
            </motion.div>
          ))}
        </div>
        <p className="text-lg font-bold text-yellow-300">+{result.gainedXp} XP{!result.firstTime && ' (Wiederholung)'}</p>
        {result.leveledUp && <p className="mt-1 font-bold text-sky-400">🎉 Level-Up! Du bist jetzt Level {result.level}</p>}
        {milestone && result.firstTime && <p className="mt-1 text-sm text-yellow-400">Meilenstein erreicht!</p>}
        <p className="mt-1 text-sm text-orange-400">🔥 Streak: {result.streak} {result.streak === 1 ? 'Tag' : 'Tage'}</p>
        <button onClick={onExit} className="mt-5 w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-400">
          Weiter zum Pfad
        </button>
      </motion.div>
    </div>
  );
}
