import { useState } from 'react';
import { Flame, Volume2, VolumeX, Zap } from 'lucide-react';
import { effectiveStreak, levelForXp, useProgressStore, XP_PER_LEVEL } from '@/store/progressStore';
import { isMuted, setMuted, sfx } from '@/lib/sound';

export function Header({ onHome }: { onHome?: () => void }) {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => effectiveStreak(s));
  const [muted, setM] = useState(isMuted());
  const level = levelForXp(xp);
  const into = xp % XP_PER_LEVEL;

  return (
    <header className="flex items-center gap-4 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
      <button onClick={onHome} className="flex items-center gap-2 font-bold text-emerald-400">
        <Zap className="h-5 w-5" /> Arduino Lab
      </button>
      <div className="ml-auto flex items-center gap-4 text-sm">
        <span title="Streak (Tage in Folge)" className="flex items-center gap-1 font-semibold text-orange-400">
          <Flame className="h-4 w-4" /> {streak}
        </span>
        <div className="flex items-center gap-2" title={`${into}/${XP_PER_LEVEL} XP bis Level ${level + 1}`}>
          <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-bold text-yellow-300">Lv {level}</span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full bg-yellow-400 transition-all" style={{ width: `${into}%` }} />
          </div>
          <span className="w-14 text-xs text-slate-400">{xp} XP</span>
        </div>
        <button
          aria-label={muted ? 'Ton an' : 'Ton aus'}
          onClick={() => { setMuted(!muted); setM(!muted); if (muted) sfx.click(); }}
          className="text-slate-400 hover:text-white"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
