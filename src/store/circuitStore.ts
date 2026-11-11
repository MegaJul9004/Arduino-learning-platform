import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wire } from '@/types/circuit';
import { checkConnection } from '@/lib/circuit';

export const WIRE_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f8fafc', '#a855f7', '#f97316', '#111827'];

interface CircuitStore {
  wires: Wire[];
  pendingFrom: string | null;
  selectedWire: string | null;
  color: string;
  /** Letzte Meldung (Erfolg/Fehler) für Toast */
  message: { type: 'ok' | 'error'; text: string; at: number } | null;

  clickPin: (pinId: string) => void;
  cancelPending: () => void;
  selectWire: (id: string | null) => void;
  removeWire: (id: string) => void;
  setColor: (c: string) => void;
  clearWires: () => void;
}

export const useCircuitStore = create<CircuitStore>()(
  persist(
    (set, get) => ({
      wires: [],
      pendingFrom: null,
      selectedWire: null,
      color: WIRE_COLORS[0],
      message: null,

      clickPin: (pinId) => {
        const { pendingFrom, wires, color } = get();
        if (!pendingFrom) return set({ pendingFrom: pinId, selectedWire: null });
        if (pendingFrom === pinId) return set({ pendingFrom: null });
        const check = checkConnection(pendingFrom, pinId, wires);
        if (!check.ok) {
          return set({ pendingFrom: null, message: { type: 'error', text: check.message, at: Date.now() } });
        }
        const wire: Wire = { id: crypto.randomUUID(), from: pendingFrom, to: pinId, color };
        set({
          wires: [...wires, wire],
          pendingFrom: null,
          message: { type: 'ok', text: `${pendingFrom} → ${pinId} verbunden`, at: Date.now() },
        });
      },
      cancelPending: () => set({ pendingFrom: null }),
      selectWire: (id) => set({ selectedWire: id, pendingFrom: null }),
      removeWire: (id) =>
        set((s) => ({ wires: s.wires.filter((w) => w.id !== id), selectedWire: null })),
      setColor: (color) => set({ color }),
      clearWires: () => set({ wires: [], pendingFrom: null, selectedWire: null }),
    }),
    { name: 'arduino-lab-circuit', partialize: (s) => ({ wires: s.wires, color: s.color }) },
  ),
);
