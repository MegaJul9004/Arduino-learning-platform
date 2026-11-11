/** Minimaler WebAudio-Synth für Feedback-Sounds (keine Assets nötig). */
let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => (muted = m);
export const isMuted = () => muted;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (muted || typeof window === 'undefined') return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  click: () => tone(660, 0, 0.06, 'square', 0.05),
  connect: () => (tone(520, 0, 0.07, 'triangle'), tone(780, 0.07, 0.09, 'triangle')),
  error: () => (tone(220, 0, 0.18, 'sawtooth', 0.12), tone(165, 0.16, 0.25, 'sawtooth', 0.12)),
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, 'triangle', 0.16)),
  levelUp: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.25, 'square', 0.08)),
};
