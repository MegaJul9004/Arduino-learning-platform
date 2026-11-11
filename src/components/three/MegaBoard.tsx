import { Label3D } from './Label3D';
import { BOARD_SIZE, COMPONENTS, GROUP_LABELS, SHIELD_Y } from '@/data/megaPins';

const BOX_BOTTOM = -0.13;
const BOX_TOP = SHIELD_Y - 0.18;

/** Schematisches Modell: Mega-PCB, aufgestecktes Shield v2.4 (transparent), USB, DC-Buchse, Chip, Bauteile. */
export function MegaBoard() {
  const { w, d, h } = BOARD_SIZE;
  return (
    <group>
      {/* Werkbank */}
      <mesh position={[0, -0.19, 0]} receiveShadow>
        <boxGeometry args={[16, 0.1, 13]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Mega PCB */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#0e7490" roughness={0.6} />
      </mesh>
      {/* USB-B */}
      <mesh position={[-w / 2 + 0.6, 0.45, -1.2]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* DC-Buchse */}
      <mesh position={[-w / 2 + 0.5, 0.5, 1.4]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.9]} />
        <meshStandardMaterial color="#111827" roughness={0.5} />
      </mesh>
      {/* ATmega2560 */}
      <mesh position={[1.0, 0.18, 0.0]} castShadow>
        <boxGeometry args={[1.7, 0.2, 1.7]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      {/* Shield v2.4 – transparente Platte auf Pin-Ebene */}
      <mesh position={[0, SHIELD_Y - 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.2, 0.08, d - 0.2]} />
        <meshStandardMaterial color="#1d4ed8" transparent opacity={0.55} roughness={0.5} />
      </mesh>
      {/* Abstandshalter Board ↔ Shield */}
      {[
        [-4.6, -2.3],
        [-4.6, 2.3],
        [4.6, -2.3],
        [4.6, 2.3],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (SHIELD_Y - 0.28) / 2, z]}>
          <cylinderGeometry args={[0.1, 0.1, SHIELD_Y - 0.28, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} />
        </mesh>
      ))}

      {/* Bauteile */}
      {COMPONENTS.map((c) =>
        c.shape === 'led' ? (
          <group key={c.id} position={[c.center[0], c.center[1] - 0.3, c.center[2]]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.4, 16]} />
              <meshStandardMaterial color={c.color} transparent opacity={0.85} emissive="#7f1d1d" />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <sphereGeometry args={[0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={c.color} transparent opacity={0.85} emissive="#7f1d1d" />
            </mesh>
            <Label3D text={c.label} position={[0, 1.15, 0]} size={0.3} />
          </group>
        ) : (
          <group key={c.id} position={[c.center[0], 0, c.center[2]]}>
            <mesh position={[0, (BOX_TOP + BOX_BOTTOM) / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[c.width, BOX_TOP - BOX_BOTTOM, 1.0]} />
              <meshStandardMaterial color={c.color} roughness={0.55} />
            </mesh>
            <Label3D text={c.label} position={[0, SHIELD_Y + 0.7, 0]} size={0.3} />
          </group>
        ),
      )}

      {GROUP_LABELS.map((l) => (
        <Label3D key={l.text} text={l.text} position={l.position} size={0.24} color="#bae6fd" background={null} />
      ))}
    </group>
  );
}
