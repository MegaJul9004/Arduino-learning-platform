import type { ComponentDef, Pin, PinCapability, PinGroup, PinKind, Vec3 } from '@/types/circuit';

/** 1 Szenen-Einheit = 1 cm. Mega 2560: 101.6 × 53.3 mm. */
export const BOARD_SIZE = { w: 10.16, d: 5.33, h: 0.16 };
export const PITCH = 0.254; // 2.54 mm Rastermaß
export const SHIELD_Y = 1.0; // Höhe der Shield-Pinebene

const pins: Pin[] = [];

function add(
  id: string,
  label: string,
  kind: PinKind,
  group: PinGroup,
  position: Vec3,
  capabilities: PinCapability[] = [],
  arduinoPin?: number,
) {
  pins.push({ id, label, kind, group, position, capabilities, arduinoPin });
}

const PWM = new Set([...Array.from({ length: 12 }, (_, i) => i + 2), 44, 45, 46]);
const INT = new Set([2, 3, 18, 19, 20, 21]);

function digitalCaps(n: number): PinCapability[] {
  const caps: PinCapability[] = [];
  if (PWM.has(n)) caps.push('PWM');
  if (INT.has(n)) caps.push('INTERRUPT');
  if (n === 20) caps.push('I2C_SDA');
  if (n === 21) caps.push('I2C_SCL');
  if (n === 51) caps.push('SPI_MOSI');
  if (n === 50) caps.push('SPI_MISO');
  if (n === 52) caps.push('SPI_SCK');
  if (n === 53) caps.push('SPI_SS');
  if ([1, 14, 16, 18].includes(n)) caps.push('UART_TX');
  if ([0, 15, 17, 19].includes(n)) caps.push('UART_RX');
  return caps;
}

// Obere Kante: GND + D13…D0
const TOP_Z = -2.3;
add('GND_T', 'GND', 'gnd', 'digital-0-13', [-3.6 - PITCH, SHIELD_Y, TOP_Z]);
for (let n = 13; n >= 0; n--) {
  add(`D${n}`, `D${n}`, 'digital', 'digital-0-13', [-3.6 + (13 - n) * PITCH, SHIELD_Y, TOP_Z], digitalCaps(n), n);
}
// Kommunikation D14…D21
for (let n = 14; n <= 21; n++) {
  add(`D${n}`, `D${n}`, 'digital', 'digital-14-21', [0 + (n - 14) * PITCH, SHIELD_Y, TOP_Z], digitalCaps(n), n);
}

// Untere Kante: Power + A0…A15
const BOT_Z = 2.3;
const power: [string, string, PinKind][] = [
  ['3V3', '3.3V', 'power3v3'],
  ['5V_P', '5V', 'power5v'],
  ['GND_P1', 'GND', 'gnd'],
  ['GND_P2', 'GND', 'gnd'],
  ['VIN', 'VIN', 'vin'],
];
power.forEach(([id, label, kind], i) =>
  add(id, label, kind, 'power', [-3.6 + i * PITCH, SHIELD_Y, BOT_Z]),
);
for (let i = 0; i < 16; i++) {
  const x = i < 8 ? -1.6 + i * PITCH : 0.7 + (i - 8) * PITCH;
  add(`A${i}`, `A${i}`, 'analog', 'analog', [x, SHIELD_Y, BOT_Z], ['ADC'], 54 + i);
}

// Rechter Doppel-Header D22…D53 (+5V oben, GND unten)
const RX = 4.5;
add('5V_R1', '5V', 'power5v', 'digital-22-53', [RX, SHIELD_Y, -1.9 - PITCH]);
add('5V_R2', '5V', 'power5v', 'digital-22-53', [RX + PITCH, SHIELD_Y, -1.9 - PITCH]);
for (let i = 0; i < 16; i++) {
  const z = -1.9 + i * PITCH;
  const a = 22 + i * 2;
  const b = a + 1;
  add(`D${a}`, `D${a}`, 'digital', 'digital-22-53', [RX, SHIELD_Y, z], digitalCaps(a), a);
  add(`D${b}`, `D${b}`, 'digital', 'digital-22-53', [RX + PITCH, SHIELD_Y, z], digitalCaps(b), b);
}
add('GND_R1', 'GND', 'gnd', 'digital-22-53', [RX, SHIELD_Y, 1.9 + PITCH]);
add('GND_R2', 'GND', 'gnd', 'digital-22-53', [RX + PITCH, SHIELD_Y, 1.9 + PITCH]);

// ───────── Bauteile ─────────
export const COMPONENTS: ComponentDef[] = [];
const COMP_PITCH = 0.5;

function addComponent(
  id: string,
  label: string,
  color: string,
  center: Vec3,
  pinSpecs: [string, string, PinKind?][],
  shape: 'led' | 'box' = 'box',
  pitch = COMP_PITCH,
) {
  const n = pinSpecs.length;
  const x0 = center[0] - ((n - 1) * pitch) / 2;
  pinSpecs.forEach(([pid, plabel, kind], i) =>
    add(pid, plabel, kind ?? 'component', 'component', [x0 + i * pitch, SHIELD_Y, center[2]]),
  );
  COMPONENTS.push({ id, label, color, shape, center, width: (n - 1) * pitch + 0.9, pinIds: pinSpecs.map((s) => s[0]) });
}

/** Legt Bauteile nebeneinander in einer Reihe ab. */
function layoutRow(
  z: number,
  startX: number,
  specs: { id: string; label: string; color: string; pins: [string, string, PinKind?][] }[],
) {
  let cursor = startX;
  for (const s of specs) {
    const width = (s.pins.length - 1) * COMP_PITCH + 0.9;
    addComponent(s.id, s.label, s.color, [cursor + width / 2, SHIELD_Y, z], s.pins);
    cursor += width + 0.4;
  }
}

addComponent('LED1', 'LED', '#ef4444', [-1.4, SHIELD_Y, -0.2], [['LED1_A', 'LED +'], ['LED1_K', 'LED −']], 'led', 0.4);

layoutRow(4.4, -5.5, [
  { id: 'BTN1', label: 'Taster', color: '#475569', pins: [['BTN1_1', 'Taster 1'], ['BTN1_2', 'Taster 2']] },
  { id: 'POT1', label: 'Potentiometer', color: '#2563eb', pins: [['POT1_VCC', 'POT VCC'], ['POT1_SIG', 'POT Signal'], ['POT1_GND', 'POT GND']] },
  { id: 'BUZ1', label: 'Piezo-Buzzer', color: '#111827', pins: [['BUZ1_P', 'Buzzer +'], ['BUZ1_N', 'Buzzer −']] },
  { id: 'SERVO1', label: 'Servo SG90', color: '#0ea5e9', pins: [['SERVO1_SIG', 'Servo Signal'], ['SERVO1_VCC', 'Servo VCC'], ['SERVO1_GND', 'Servo GND']] },
  { id: 'HCSR04', label: 'HC-SR04', color: '#0d9488', pins: [['US_VCC', 'US VCC'], ['US_TRIG', 'US Trig'], ['US_ECHO', 'US Echo'], ['US_GND', 'US GND']] },
]);
layoutRow(-4.5, -4.8, [
  { id: 'LCD1', label: 'I²C-Display', color: '#15803d', pins: [['LCD_GND', 'LCD GND'], ['LCD_VCC', 'LCD VCC'], ['LCD_SDA', 'LCD SDA'], ['LCD_SCL', 'LCD SCL']] },
  { id: 'SD1', label: 'SD-Modul (SPI)', color: '#7c3aed', pins: [['SD_VCC', 'SD VCC'], ['SD_GND', 'SD GND'], ['SD_MISO', 'SD MISO'], ['SD_MOSI', 'SD MOSI'], ['SD_SCK', 'SD SCK'], ['SD_CS', 'SD CS']] },
  { id: 'EXT1', label: 'Ext. Netzteil 5V', color: '#b45309', pins: [['EXT_5V', 'EXT 5V', 'power5v'], ['EXT_GND', 'EXT GND', 'gnd']] },
]);

export const ALL_PINS: readonly Pin[] = pins;
export const PIN_BY_ID: ReadonlyMap<string, Pin> = new Map(pins.map((p) => [p.id, p]));

export const PIN_COLORS: Record<PinKind, string> = {
  digital: '#facc15',
  analog: '#38bdf8',
  power5v: '#ef4444',
  power3v3: '#fb923c',
  vin: '#f472b6',
  gnd: '#1e293b',
  component: '#a3e635',
};

export const GROUP_LABELS: { text: string; position: Vec3 }[] = [
  { text: 'DIGITAL 0–13', position: [-2.0, SHIELD_Y, -2.75] },
  { text: 'COMM 14–21', position: [0.9, SHIELD_Y, -2.75] },
  { text: 'POWER', position: [-3.1, SHIELD_Y, 2.75] },
  { text: 'ANALOG A0–A15', position: [1.4, SHIELD_Y, 2.75] },
  { text: 'DIGITAL 22–53', position: [4.75, SHIELD_Y, -2.75] },
];
