# Arduino Lab – MEGA Shield v2.4

Gamifizierte Lernplattform für den **Arduino MEGA 2560** mit **Sensor Shield v2.4**: zwei Lernpfade im Duolingo-Stil, ein interaktiver 3D-Verkabelungssimulator (Three.js) und ein Code-Labor mit Monaco-Editor.

## Features

- **Pfad A – Elektronik & Verkabelung** (10 Stufen): LED, Taster, Potentiometer, PWM, Servo, HC-SR04, Interrupt-Pins, I²C, SPI, externe Stromversorgung
- **Pfad B – C/C++ Programmierung** (10 Stufen): `millis()`, Ein-/Ausgänge, Serial, Arrays & Funktionen, Interrupts, Libraries, Klassen, Register, Timer-Interrupts & Zustandsautomaten
- **3D-Werkbank**: Mega + Shield, Klick-zu-Klick-Jumperkabel mit Snap-to-Pin, Kabelfarben, Kurzschluss-Erkennung
- **Code-Labor**: Monaco-Editor, Arduino-Autovervollständigung, Live-Linter, regelbasierter Prüfer, Hybrid-Lektionen (Code + Verkabelung)
- **Gamification**: XP, Level, Streak, Sterne, Meilenstein-Truhen, Profi-Tipps, Sound-Feedback
- **Offline-First**: Fortschritt und Verkabelung im `localStorage`

## Voraussetzungen

- [Node.js](https://nodejs.org) **18 oder neuer** (getestet mit v24)
- npm (kommt mit Node.js)
- Moderner Browser mit WebGL
- Internetverbindung beim ersten Laden des Code-Editors (Monaco wird von einem CDN geladen)

## Installation & Start

```bash
git clone <REPO-URL>
cd arduino-lab
npm install
npm run dev
```

Danach im Browser **http://localhost:5173** öffnen.

## Skripte

| Befehl            | Beschreibung                                 |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Entwicklungsserver mit Hot Reload            |
| `npm run build`   | Typprüfung (`tsc`) und Produktions-Build     |
| `npm run preview` | Produktions-Build lokal ansehen              |
| `npm test`        | Logik-Tests (Vitest)                         |

## Deployment

`npm run build` erzeugt statische Dateien im Ordner `dist/`. Diese lassen sich bei jedem statischen Hoster bereitstellen (GitHub Pages, Netlify, Vercel, Nginx …).

Bei Auslieferung in einem Unterverzeichnis (z. B. GitHub Pages unter `/repo-name/`) in `vite.config.ts` zusätzlich `base: '/repo-name/'` setzen.

## Bedienung der 3D-Werkbank

| Aktion                    | Bedienung                         |
| ------------------------- | --------------------------------- |
| Kabel starten / beenden   | Pin anklicken, dann Ziel-Pin      |
| Abbrechen                 | `Esc` oder Klick ins Leere        |
| Kabel auswählen / löschen | Kabel anklicken, dann `Entf`      |
| Kamera                    | Ziehen = drehen, Mausrad = Zoom   |

## Projektstruktur

```
src/
  types/        circuit.ts, curriculum.ts        Datenmodell
  data/         megaPins.ts                       Pin-Layout & Bauteile
                curriculum/                       Lektionen (wiring.ts, code.ts)
  lib/          circuit.ts                        Kollisions- & Regelprüfung
                codeValidator.ts, stepCheck.ts    Linter & Code-Prüfer
                arduinoCompletions.ts, sound.ts
  store/        circuitStore.ts, progressStore.ts Zustand (Zustand + localStorage)
  components/
    three/      Stage, MegaBoard, PinMesh, Jumper, Label3D
    ui/         Dashboard, PathView, LessonView, CodePanel, Overlays …
```

## Eigene Lektionen hinzufügen

Lektionen sind reine Daten in `src/data/curriculum/`. Eine Lektion besteht aus Schritten (`theory`, `wiring`, `code`, `hybrid`) mit:

- `wiringRules`: Pin A muss mit Pin B verbunden sein (optional `forbidden: true`)
- `codeRules`: RegEx-Muster, das im Code vorkommen (oder bei `forbidden` fehlen) muss; `requiresWiredPin` verknüpft die Regel mit der 3D-Szene

Neue Bauteile werden in `src/data/megaPins.ts` registriert.

## Tech-Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Three.js / `@react-three/fiber` / `@react-three/drei` · Zustand · Framer Motion · Monaco Editor · Lucide · Vitest

## Fortschritt zurücksetzen

Auf dem Dashboard „Fortschritt zurücksetzen“ klicken, oder im Browser den `localStorage` für die Seite leeren (`arduino-lab-progress`, `arduino-lab-circuit`).

## Fehlerbehebung

- **Schwarzes Bild / keine 3D-Szene:** WebGL im Browser aktivieren bzw. Hardwarebeschleunigung einschalten.
- **Editor zeigt nur „Editor wird geladen …“:** Internetverbindung prüfen (Monaco-CDN).
- **Port 5173 belegt:** `npm run dev -- --port 3000`.
