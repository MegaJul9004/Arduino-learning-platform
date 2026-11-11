import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '@/types/circuit';

interface Props {
  text: string;
  position: Vec3;
  /** Höhe in Szenen-Einheiten */
  size?: number;
  color?: string;
  background?: string | null;
}

/** Text-Label als Sprite (CanvasTexture) – ersetzt drei/<Html>, vermeidet DOM-Unmount-Probleme. */
export function Label3D({ text, position, size = 0.28, color = '#cbd5e1', background = 'rgba(15,23,42,0.75)' }: Props) {
  const { texture, aspect } = useMemo(() => {
    const px = 64;
    const font = `600 ${px * 0.62}px system-ui, sans-serif`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width + px * 0.6);
    canvas.width = w;
    canvas.height = px;
    ctx.font = font;
    if (background) {
      ctx.fillStyle = background;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, px, 12);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, px / 2 + 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return { texture: t, aspect: w / px };
  }, [text, color, background]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={[size * aspect, size, 1]} raycast={() => null} renderOrder={10}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
