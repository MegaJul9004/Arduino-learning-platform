/** Kern-Typen der 3D-Verkabelungssimulation. */

export type Vec3 = [number, number, number];

export type PinKind =
  | 'digital'
  | 'analog'
  | 'power5v'
  | 'power3v3'
  | 'vin'
  | 'gnd'
  | 'component';

export type PinCapability =
  | 'PWM'
  | 'INTERRUPT'
  | 'I2C_SDA'
  | 'I2C_SCL'
  | 'SPI_MOSI'
  | 'SPI_MISO'
  | 'SPI_SCK'
  | 'SPI_SS'
  | 'UART_TX'
  | 'UART_RX'
  | 'ADC';

/** Gruppierung der Header auf Board/Shield (für Labels & Kollisionslogik). */
export type PinGroup =
  | 'digital-0-13'
  | 'digital-14-21'
  | 'digital-22-53'
  | 'analog'
  | 'power'
  | 'component';

export interface Pin {
  /** Eindeutige ID, z. B. "D13", "A0", "GND_1", "LED1_A". */
  id: string;
  label: string;
  kind: PinKind;
  group: PinGroup;
  /** Position in Szenen-Einheiten (1 Einheit = 1 cm), Weltkoordinaten. */
  position: Vec3;
  capabilities: PinCapability[];
  /** Arduino-Pinnummer (nur digital/analog), z. B. 13 für D13. */
  arduinoPin?: number;
}

export interface Wire {
  id: string;
  from: string;
  to: string;
  /** CSS-Farbe des Jumper-Kabels. */
  color: string;
}

export interface CircuitState {
  wires: Wire[];
}

/** Regel: Pin `a` muss elektrisch mit Pin `b` verbunden sein (gleiches Netz). */
export interface PinConnectionRule {
  id: string;
  a: string;
  b: string;
  /** Wenn true, genügt eine indirekte Verbindung über mehrere Kabel. Default: true */
  allowIndirect?: boolean;
  /** Anzeigetext für den Lernenden. */
  description: string;
  /** Hinweis, der bei Nichterfüllung angezeigt wird. */
  hint?: string;
  /** true = Regel gilt als erfüllt, wenn a und b NICHT verbunden sind. */
  forbidden?: boolean;
}

/** Bauteil auf der Werkbank (LED, Taster, Sensor …). */
export interface ComponentDef {
  id: string;
  label: string;
  color: string;
  shape: 'led' | 'box';
  center: Vec3;
  width: number;
  pinIds: string[];
}

export type ConnectionCheck =
  | { ok: true }
  | { ok: false; code: 'SAME_PIN' | 'DUPLICATE' | 'SHORT_CIRCUIT' | 'UNKNOWN_PIN'; message: string };

export interface RuleResult {
  rule: PinConnectionRule;
  satisfied: boolean;
}

