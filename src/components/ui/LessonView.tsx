import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Stage } from '@/components/three/Stage';
import type { Lesson } from '@/types/curriculum';
import { useCircuitStore } from '@/store/circuitStore';
import { useProgressStore, type CompletionResult } from '@/store/progressStore';
import { checkStep, type StepCheck } from '@/lib/stepCheck';
import { sfx } from '@/lib/sound';
import { Header } from './Header';
import { Markdown } from './Markdown';
import { Toast } from './Toast';
import { CodePanel } from './CodePanel';
import { WiringTools } from './WiringTools';
import { CompleteOverlay, TipsOverlay } from './Overlays';

export function LessonView({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const wires = useCircuitStore((s) => s.wires);
  const { selectedWire, removeWire, cancelPending, selectWire, clearWires } = useCircuitStore();
  const completeLesson = useProgressStore((s) => s.completeLesson);

  const [si, setSi] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(lesson.steps.filter((s) => s.starterCode).map((s) => [s.id, s.starterCode!])),
  );
  const [feedback, setFeedback] = useState<StepCheck | null>(null);
  const [fails, setFails] = useState(0);
  const [phase, setPhase] = useState<'steps' | 'tips' | 'done'>('steps');
  const [result, setResult] = useState<CompletionResult | null>(null);

  const step = lesson.steps[si];
  const code = codes[step.id] ?? '';
  const interactive = step.kind !== 'theory';
  const showStage = lesson.steps.some((s) => s.kind !== 'theory');

  // Neue Lektion = leere Werkbank
  useEffect(() => { clearWires(); }, [clearWires, lesson.id]);

  // Tastatur: Esc bricht ab, Entf löscht ausgewähltes Kabel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.monaco-editor') || /INPUT|TEXTAREA/.test(t.tagName)) return;
      if (e.key === 'Escape') { cancelPending(); selectWire(null); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWire) removeWire(selectedWire);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedWire, removeWire, cancelPending, selectWire]);

  // Live-Status der Checkliste
  const live = useMemo(() => checkStep(step, code, wires), [step, code, wires]);

  // Fehler-Feedback verschwindet, sobald der Lernende etwas ändert
  useEffect(() => { setFeedback((f) => (f && !f.passed ? null : f)); }, [wires, code]);

  const check = () => {
    const res = checkStep(step, code, wires);
    setFeedback(res);
    if (res.passed) sfx.success();
    else { sfx.error(); setFails((n) => n + 1); }
  };

  const next = () => {
    sfx.click();
    setFeedback(null);
    if (si < lesson.steps.length - 1) setSi(si + 1);
    else setPhase('tips');
  };

  const finish = () => {
    const xp = lesson.steps.reduce((a, s) => a + s.xp, 0);
    const stars = fails === 0 ? 3 : fails <= 2 ? 2 : 1;
    const res = completeLesson(lesson.id, xp, stars);
    res.leveledUp ? sfx.levelUp() : sfx.success();
    setResult(res);
    setPhase('done');
  };

  const errorLint = feedback && !feedback.passed ? feedback.lint.filter((l) => l.severity === 'error') : [];

  return (
    <div className="flex h-full flex-col">
      <Header onHome={onExit} />
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(240px,40%)_1fr] md:grid-cols-[1fr_480px] md:grid-rows-1">
        <div className="relative min-h-0 bg-slate-950">
          {showStage ? <><Toast /><Stage /></> : (
            <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
              Die 3D-Werkbank ist in der Praxisaufgabe verfügbar.
            </div>
          )}
        </div>

        <aside className="flex min-h-0 flex-col border-l border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
            <button onClick={onExit} aria-label="Lektion verlassen" className="text-slate-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-emerald-400">{lesson.path === 'wiring' ? 'Pfad A' : 'Pfad B'} · Lektion {lesson.order}</p>
              <h2 className="truncate font-bold">{lesson.title}</h2>
            </div>
            <div className="flex gap-1" aria-label={`Schritt ${si + 1} von ${lesson.steps.length}`}>
              {lesson.steps.map((s, i) => <span key={s.id} className={`h-2 w-6 rounded-full ${i < si ? 'bg-emerald-500' : i === si ? 'bg-sky-400' : 'bg-slate-700'}`} />)}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <h3 className="text-lg font-bold">{step.title}</h3>
            <Markdown text={step.content} />

            {interactive && (
              <ul className="space-y-1.5">
                {live.items.map((it) => (
                  <li key={it.id} className="flex items-start gap-2 text-sm">
                    {it.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
                    <span className={it.ok ? 'text-slate-200' : 'text-slate-400'}>{it.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {(step.kind === 'code' || step.kind === 'hybrid') && step.starterCode && (
              <CodePanel code={code} starter={step.starterCode} onChange={(c) => setCodes((p) => ({ ...p, [step.id]: c }))} />
            )}
            {(step.kind === 'wiring' || step.kind === 'hybrid') && <WiringTools />}
          </div>

          <div className="space-y-3 border-t border-slate-800 p-4">
            {feedback && (
              feedback.passed ? (
                <div className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-300" role="status">✅ Super, alles korrekt!</div>
              ) : (
                <div className="space-y-1 rounded-xl bg-red-500/15 p-3 text-sm text-red-200" role="alert">
                  <p className="flex items-center gap-1 font-semibold"><XCircle className="h-4 w-4" /> Noch nicht ganz:</p>
                  {errorLint.map((l, i) => <p key={`l${i}`}>• Zeile {l.line}: {l.message}</p>)}
                  {feedback.items.filter((i) => !i.ok).map((i) => <p key={i.id}>• {i.hint ?? i.label}</p>)}
                </div>
              )
            )}
            {!interactive ? (
              <button onClick={next} className="w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-400">Weiter</button>
            ) : feedback?.passed ? (
              <button onClick={next} className="w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-bold text-white hover:bg-emerald-400">Weiter</button>
            ) : (
              <button onClick={check} className="w-full rounded-xl border-b-4 border-sky-700 bg-sky-500 py-3 font-bold text-white hover:bg-sky-400">Prüfen</button>
            )}
          </div>
        </aside>
      </div>

      {phase === 'tips' && <TipsOverlay tips={lesson.proTips ?? [{ title: 'Gut gemacht', body: 'Weiter so!' }]} milestone={lesson.milestone} onContinue={finish} />}
      {phase === 'done' && result && <CompleteOverlay result={result} milestone={lesson.milestone} onExit={onExit} />}
    </div>
  );
}
