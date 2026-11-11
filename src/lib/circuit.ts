import type { ConnectionCheck, Pin, PinConnectionRule, RuleResult, Wire } from '@/types/circuit';
import { ALL_PINS, PIN_BY_ID } from '@/data/megaPins';

const POWER_KINDS = new Set(['power5v', 'power3v3', 'vin']);

/** Prüft, ob ein neues Kabel zwischen `fromId` und `toId` zulässig ist (Kollisionsabfrage). */
export function checkConnection(fromId: string, toId: string, wires: Wire[]): ConnectionCheck {
  const a = PIN_BY_ID.get(fromId);
  const b = PIN_BY_ID.get(toId);
  if (!a || !b) return { ok: false, code: 'UNKNOWN_PIN', message: 'Unbekannter Pin.' };
  if (a.id === b.id) return { ok: false, code: 'SAME_PIN', message: 'Start und Ziel sind derselbe Pin.' };
  if (wires.some((w) => (w.from === a.id && w.to === b.id) || (w.from === b.id && w.to === a.id))) {
    return { ok: false, code: 'DUPLICATE', message: 'Diese Verbindung existiert bereits.' };
  }
  if (isShort(a, b)) {
    return {
      ok: false,
      code: 'SHORT_CIRCUIT',
      message: `Kurzschluss! ${a.label} direkt mit ${b.label} zu verbinden zerstört dein Board.`,
    };
  }
  // Indirekter Kurzschluss: würde das neue Kabel zwei verschiedene Versorgungsnetze vereinen?
  const nets = buildNets([...wires, { id: 'tmp', from: a.id, to: b.id, color: '' }]);
  const net = nets.get(a.id);
  if (net) {
    const members = [...nets.entries()].filter(([, n]) => n === net).map(([id]) => PIN_BY_ID.get(id)!);
    const hasGnd = members.some((p) => p.kind === 'gnd');
    const rails = new Set(members.filter((p) => POWER_KINDS.has(p.kind)).map((p) => p.kind));
    if ((hasGnd && rails.size > 0) || rails.size > 1) {
      return {
        ok: false,
        code: 'SHORT_CIRCUIT',
        message: 'Kurzschluss: Dieses Kabel würde Versorgungsspannung und Masse (oder zwei Spannungen) verbinden.',
      };
    }
  }
  return { ok: true };
}

function isShort(a: Pin, b: Pin): boolean {
  const pa = POWER_KINDS.has(a.kind);
  const pb = POWER_KINDS.has(b.kind);
  if (pa && b.kind === 'gnd') return true;
  if (pb && a.kind === 'gnd') return true;
  return pa && pb && a.kind !== b.kind;
}

/**
 * Union-Find über alle Kabel → Map Pin-ID → Netz-ID.
 * Auf dem Board sind alle GND-Pins (und alle 5V-Pins) intern verbunden – das wird hier
 * implizit berücksichtigt. Externe Bauteil-Versorgung (group "component") bleibt separat.
 */
export function buildNets(wires: Wire[]): Map<string, string> {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    parent.set(x, r);
    return r;
  };
  const union = (a: string, b: string) => parent.set(find(a), find(b));
  let firstGnd: string | null = null;
  let first5v: string | null = null;
  for (const p of ALL_PINS) {
    if (p.group === 'component') continue;
    if (p.kind === 'gnd') firstGnd ? union(p.id, firstGnd) : (firstGnd = p.id, find(p.id));
    if (p.kind === 'power5v') first5v ? union(p.id, first5v) : (first5v = p.id, find(p.id));
  }
  for (const w of wires) union(w.from, w.to);
  const out = new Map<string, string>();
  for (const id of [...parent.keys()]) out.set(id, find(id));
  return out;
}

/** Wertet Verkabelungsregeln gegen den aktuellen Graphen aus. */
export function evaluateRules(rules: PinConnectionRule[], wires: Wire[]): RuleResult[] {
  const nets = buildNets(wires);
  return rules.map((rule) => {
    const na = nets.get(rule.a);
    const connected = !!na && na === nets.get(rule.b);
    const direct = wires.some(
      (w) => (w.from === rule.a && w.to === rule.b) || (w.from === rule.b && w.to === rule.a),
    );
    const isConn = direct || (rule.allowIndirect !== false && connected);
    return { rule, satisfied: rule.forbidden ? !isConn : isConn };
  });
}

/** Pin-IDs, die mindestens ein Kabel haben (z. B. für Code↔Szene-Prüfung in Phase 4). */
export function wiredPinIds(wires: Wire[]): Set<string> {
  const s = new Set<string>();
  wires.forEach((w) => (s.add(w.from), s.add(w.to)));
  return s;
}
