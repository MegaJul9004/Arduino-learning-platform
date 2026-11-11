import { memo, useState } from 'react';
import { Label3D } from './Label3D';
import type { Pin } from '@/types/circuit';
import { PIN_COLORS } from '@/data/megaPins';

interface Props {
  pin: Pin;
  active: boolean;
  wired: boolean;
  onClick: (id: string) => void;
}

/** Klickbarer Pin (Header-Stift + vergrößerte, unsichtbare Hitbox für leichtes Zielen / Snap). */
export const PinMesh = memo(function PinMesh({ pin, active, wired, onClick }: Props) {
  const [hover, setHover] = useState(false);
  const color = PIN_COLORS[pin.kind];
  const lit = hover || active;

  return (
    <group position={pin.position}>
      {/* sichtbarer Stift */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial
          color={lit ? '#ffffff' : color}
          emissive={lit ? color : wired ? color : '#000000'}
          emissiveIntensity={lit ? 0.9 : wired ? 0.25 : 0}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      {/* Snap-Hitbox */}
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(pin.id);
        }}
      >
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
      {lit && <Label3D text={pin.capabilities.length ? `${pin.label} · ${pin.capabilities.join(" · ")}` : pin.label} position={[0, 0.55, 0]} size={0.3} color="#ffffff" />}
    </group>
  );
});
