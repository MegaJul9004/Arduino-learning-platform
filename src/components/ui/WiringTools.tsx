import { Trash2 } from 'lucide-react';
import { useCircuitStore, WIRE_COLORS } from '@/store/circuitStore';

/** Kabelfarbe, Kabelliste, Hinweise zur Bedienung. */
export function WiringTools() {
  const { wires, color, setColor, removeWire, clearWires, selectedWire, selectWire, pendingFrom } = useCircuitStore();
  return (
    <div className="space-y-3 rounded-lg bg-slate-800/50 p-3">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Kabelfarbe</p>
        <div className="flex gap-2">
          {WIRE_COLORS.map((c) => (
            <button key={c} aria-label={`Farbe ${c}`} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full border-2 ${c === color ? 'border-white' : 'border-slate-700'}`} style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400">Kabel ({wires.length})</p>
          {wires.length > 0 && <button onClick={clearWires} className="text-xs text-slate-400 hover:text-red-400">Alle entfernen</button>}
        </div>
        <ul className="max-h-28 space-y-1 overflow-y-auto">
          {wires.map((w) => (
            <li key={w.id} onClick={() => selectWire(w.id === selectedWire ? null : w.id)} className={`flex cursor-pointer items-center gap-2 rounded px-2 py-0.5 text-sm ${w.id === selectedWire ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
              <span className="h-3 w-3 rounded-full" style={{ background: w.color }} />
              <span className="flex-1">{w.from} ↔ {w.to}</span>
              <button aria-label="Kabel löschen" onClick={(e) => { e.stopPropagation(); removeWire(w.id); }}>
                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-slate-500">
        {pendingFrom ? `Start: ${pendingFrom} – klicke den Ziel-Pin (Esc = Abbrechen)` : 'Pin anklicken = Kabel starten · Kabel anklicken + Entf = löschen · Ziehen = Kamera drehen'}
      </p>
    </div>
  );
}
