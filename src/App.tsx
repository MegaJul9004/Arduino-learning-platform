import { useState } from 'react';
import type { PathType } from '@/types/curriculum';
import { Dashboard } from '@/components/ui/Dashboard';
import { PathView } from '@/components/ui/PathView';
import { LessonView } from '@/components/ui/LessonView';
import { getLesson } from '@/data/curriculum';

type View = { name: 'dashboard' } | { name: 'path'; path: PathType } | { name: 'lesson'; path: PathType; lessonId: string };

export default function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' });
  if (view.name === 'dashboard') return <Dashboard onSelect={(path) => setView({ name: 'path', path })} />;
  if (view.name === 'path') {
    return <PathView path={view.path} onBack={() => setView({ name: 'dashboard' })} onOpen={(l) => setView({ name: 'lesson', path: view.path, lessonId: l.id })} />;
  }
  return <LessonViewLoader lessonId={view.lessonId} onExit={() => setView({ name: 'path', path: view.path })} />;
}

function LessonViewLoader({ lessonId, onExit }: { lessonId: string; onExit: () => void }) {
  const lesson = getLesson(lessonId);
  if (!lesson) return <div className="p-8">Lektion nicht gefunden.</div>;
  return <LessonView key={lesson.id} lesson={lesson} onExit={onExit} />;
}
