import { useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ALL_PINS, PIN_BY_ID, SHIELD_Y } from '@/data/megaPins';
import { useCircuitStore } from '@/store/circuitStore';
import { wiredPinIds } from '@/lib/circuit';
import type { Vec3 } from '@/types/circuit';
import { MegaBoard } from './MegaBoard';
import { PinMesh } from './PinMesh';
import { Jumper } from './Jumper';

function Scene() {
  const wires = useCircuitStore((s) => s.wires);
  const pendingFrom = useCircuitStore((s) => s.pendingFrom);
  const selectedWire = useCircuitStore((s) => s.selectedWire);
  const color = useCircuitStore((s) => s.color);
  const clickPin = useCircuitStore((s) => s.clickPin);
  const cancelPending = useCircuitStore((s) => s.cancelPending);
  const selectWire = useCircuitStore((s) => s.selectWire);
  const [cursor, setCursor] = useState<Vec3 | null>(null);

  const onPin = useCallback((id: string) => clickPin(id), [clickPin]);
  const wired = wiredPinIds(wires);
  const pendingPos = pendingFrom ? PIN_BY_ID.get(pendingFrom)!.position : null;

  return (
    <>
      <color attach="background" args={['#0b1120']} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />
      <Environment preset="city" environmentIntensity={0.4} />

      <MegaBoard />
      {ALL_PINS.map((p) => (
        <PinMesh key={p.id} pin={p} active={p.id === pendingFrom} wired={wired.has(p.id)} onClick={onPin} />
      ))}

      {wires.map((w) => (
        <Jumper
          key={w.id}
          from={PIN_BY_ID.get(w.from)!.position}
          to={PIN_BY_ID.get(w.to)!.position}
          color={w.color}
          selected={w.id === selectedWire}
          onClick={() => selectWire(w.id === selectedWire ? null : w.id)}
        />
      ))}

      {/* Vorschau-Kabel folgt dem Mauszeiger */}
      {pendingPos && cursor && <Jumper preview from={pendingPos} to={cursor} color={color} />}

      {/* Unsichtbare Ebene: Cursor-Tracking + Klick ins Leere bricht ab */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, SHIELD_Y, 0]}
        visible={false}
        onPointerMove={(e) => pendingFrom && setCursor([e.point.x, SHIELD_Y, e.point.z])}
        onClick={() => {
          cancelPending();
          selectWire(null);
        }}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </mesh>

      <ContactShadows position={[0, -0.12, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={30} />
    </>
  );
}

export function Stage() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 13, 11], fov: 45 }}>
      <Scene />
    </Canvas>
  );
}
