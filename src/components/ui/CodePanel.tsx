import { useEffect, useMemo, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { RotateCcw } from 'lucide-react';
import { registerArduino } from '@/lib/arduinoCompletions';
import { lintArduino } from '@/lib/codeValidator';

interface Props {
  code: string;
  starter: string;
  onChange: (c: string) => void;
}

/** Monaco-Editor mit Arduino-Autovervollständigung und Live-Linter (Marker). */
export function CodePanel({ code, starter, onChange }: Props) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const issues = useMemo(() => lintArduino(code), [code]);

  const applyMarkers = () => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;
    monaco.editor.setModelMarkers(
      model,
      'arduino-lint',
      issues.map((i) => ({
        startLineNumber: i.line,
        endLineNumber: i.line,
        startColumn: i.col,
        endColumn: i.endCol,
        message: i.message,
        severity: i.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      })),
    );
  };
  useEffect(applyMarkers); // läuft nach jedem Render, ist billig

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <div className="flex items-center justify-between bg-slate-800 px-3 py-1 text-xs text-slate-400">
        <span>sketch.ino</span>
        <button onClick={() => onChange(starter)} className="flex items-center gap-1 hover:text-white" aria-label="Code zurücksetzen">
          <RotateCcw className="h-3 w-3" /> Zurücksetzen
        </button>
      </div>
      <Editor
        height="300px"
        language="cpp"
        theme="vs-dark"
        value={code}
        onChange={(v) => onChange(v ?? '')}
        loading={<div className="p-4 text-sm text-slate-400">Editor wird geladen …</div>}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          registerArduino(monaco);
          applyMarkers();
        }}
        options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, tabSize: 2, automaticLayout: true, wordWrap: 'on' }}
      />
      {issues.length > 0 && (
        <ul className="max-h-24 overflow-y-auto bg-slate-900 p-2 text-xs">
          {issues.map((i, k) => (
            <li key={k} className={i.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}>
              Zeile {i.line}: {i.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
