import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '@/types/circuit';

interface Props {
  from: Vec3;
  to: Vec3;
  color: string;
  selected?: boolean;
  preview?: boolean;
  onClick?: () => void;
}

/** Erzeugt eine Bogenkurve (Catmull-Rom) mit Durchhang nach oben, abhängig von der Distanz. */
export function buildWireCurve(from: Vec3, to: Vec3): THREE.CatmullRomCurve3 {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dist = a.distanceTo(b);
  const lift = 0.35 + dist * 0.22;
  const mid = a.clone().lerp(b, 0.5);
  mid.y += lift;
  const aUp = a.clone().lerp(mid, 0.25);
  aUp.y = a.y + lift * 0.75;
  const bUp = b.clone().lerp(mid, 0.25);
  bUp.y = b.y + lift * 0.75;
  const aStart = a.clone().setY(a.y + 0.15);
  const bStart = b.clone().setY(b.y + 0.15);
  return new THREE.CatmullRomCurve3([a, aStart, aUp, mid, bUp, bStart, b], false, 'centripetal');
}

export function Jumper({ from, to, color, selected, preview, onClick }: Props) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(buildWireCurve(from, to), preview ? 24 : 48, 0.035, 8, false),
    [from, to, preview],
  );
  useEffect(() => () => geometry.dispose(), [geometry]); // WebGL-Cleanup

  return (
    <mesh
      geometry={geometry}
      castShadow
      onClick={(e) => {
        if (preview) return;
        e.stopPropagation();
        onClick?.();
      }}
      raycast={preview ? () => null : undefined}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        emissive={selected ? '#ffffff' : '#000000'}
        emissiveIntensity={selected ? 0.35 : 0}
        transparent={preview}
        opacity={preview ? 0.6 : 1}
      />
    </mesh>
  );
}
