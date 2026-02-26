import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PRODUCTS } from '../constants';

// Import local logos from `logo/` folder
import imgCardapio from '../logo/App cardapio.png';
import imgDelivery from '../logo/App delivery.png';
import imgChat from '../logo/ChatGPT Image 14 de fev. de 2026, 19_14_24.png';
import imgAgendAI from '../logo/Logo AgendAI.png';
import imgExplorer from '../logo/logo app city explorer.png';
import imgFidelidade from '../logo/Logo app fidelidade.png';

const IMAGE_MAP: Record<string, string> = {
  cardapio: imgCardapio,
  delivery: imgDelivery,
  explorer: imgExplorer,
  agendai: imgAgendAI,
  fidelidade: imgFidelidade,
};

// Globe sizing defaults and visual bleed configuration
const GLOBE_RADIUS_DEFAULT = 2.4; // default globe radius
const TOP_EXTEND_DEFAULT = 48;
const BOTTOM_EXTEND_DEFAULT = 28;

// StarsBackground: realistic starfield with variable brightness and subtle twinkle
const StarsBackground: React.FC = () => {
  const ref = useRef<THREE.Group | null>(null);
  const matRef = useRef<THREE.PointsMaterial | null>(null);
  // lowered star count for better performance on deploy
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 40;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta) - 10;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const b = 0.7 + Math.random() * 0.5;
      arr[i * 3] = b;
      arr[i * 3 + 1] = b;
      arr[i * 3 + 2] = b;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.0015;
    if (matRef.current) {
      // subtle global twinkle
      matRef.current.opacity = 0.85 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
    }
  });

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} itemSize={3} count={positions.length / 3} />
          <bufferAttribute attachObject={["attributes", "color"]} array={colors} itemSize={3} count={colors.length / 3} />
        </bufferGeometry>
        <pointsMaterial ref={matRef as any} vertexColors size={0.9} sizeAttenuation color={0xffffff} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

// Connections: draw continuous tubes between app positions and animate a small glow moving along each curve
const Connections: React.FC<{ positions: THREE.Vector3[]; radius?: number }> = ({ positions, radius = GLOBE_RADIUS_DEFAULT }) => {
  // build edges: connect each app to every other (complete graph) for dense mesh
  const edges = useMemo(() => {
    const res: [number, number][] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) res.push([i, j]);
    }
    return res;
  }, [positions]);

  const glowTex = useMemo(() => makeStarTexture(64), []);

  // Precompute curves for each edge
  const curves = useMemo(() => {
    const base = edges.map(([ia, ib]) => {
      const a = positions[ia].clone();
      const b = positions[ib].clone();
      // midpoint lifted outward
      const mid = a.clone().lerp(b, 0.5).normalize().multiplyScalar(radius + 0.6);
      const pts = [a.clone().normalize().multiplyScalar(radius), mid, b.clone().normalize().multiplyScalar(radius)];
      return new THREE.CatmullRomCurve3(pts);
    });

    // add 3 extra random curves for visual density
    const extra: THREE.Curve<THREE.Vector3>[] = Array.from({ length: 3 }).map(() => {
      const theta = Math.random() * Math.PI;
      const phi = Math.random() * Math.PI * 2;
      const theta2 = Math.random() * Math.PI;
      const phi2 = Math.random() * Math.PI * 2;
      const a = new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)).normalize().multiplyScalar(radius);
      const b = new THREE.Vector3(Math.sin(theta2) * Math.cos(phi2), Math.cos(theta2), Math.sin(theta2) * Math.sin(phi2)).normalize().multiplyScalar(radius);
      const mid = a.clone().lerp(b, 0.5).normalize().multiplyScalar(radius + 0.6);
      const pts = [a.clone().normalize().multiplyScalar(radius), mid, b.clone().normalize().multiplyScalar(radius)];
      return new THREE.CatmullRomCurve3(pts);
    });

    return base.concat(extra);
  }, [edges, positions, radius]);

  // multiple moving star sprites per curve for density (reduced for performance)
  const perCurve = 4; // number of moving stars per curve
  const totalSprites = curves.length * perCurve;
  const glowRefs = useRef<Array<THREE.Sprite | null>>([]);
  const glowStates = useRef<number[]>([]);
  const glowSpeeds = useRef<number[]>([]);

  // initialize or resize glow arrays when curves change
  useEffect(() => {
    const newTotal = curves.length * perCurve;
    glowRefs.current = new Array(newTotal).fill(null);
    glowStates.current = new Array(newTotal).fill(0).map(() => Math.random());
    glowSpeeds.current = new Array(newTotal).fill(0).map(() => 0.18 + Math.random() * 0.6);
  }, [curves.length]);

  useFrame((state, delta) => {
    const cam = state.camera;
    for (let ci = 0; ci < curves.length; ci++) {
      for (let k = 0; k < perCurve; k++) {
        const idx = ci * perCurve + k;
        glowStates.current[idx] += glowSpeeds.current[idx] * delta;
        if (glowStates.current[idx] > 1) glowStates.current[idx] -= 1;
        // ensure state exists for this sprite (resilient to dynamic curve counts)
        if (glowStates.current[idx] === undefined) {
          glowStates.current[idx] = Math.random();
          glowSpeeds.current[idx] = 0.18 + Math.random() * 0.6;
        }
        const u = glowStates.current[idx];
        let p: THREE.Vector3 | null = null;
        try {
          const curve = curves[ci];
          if (curve && typeof (curve as any).getPointAt === 'function') {
            const pts = (curve as any).points;
            // basic sanity: ensure points array exists and contains Vector3-like objects
            if (Array.isArray(pts) && pts.length > 0 && pts.every((pt: any) => pt && typeof pt.x === 'number')) {
              p = (curve as any).getPointAt(u);
            }
          }
        } catch (err) {
          // skip this sprite update if curve is in an inconsistent state
          p = null;
        }
        const spr = glowRefs.current[idx];
        if (!spr) continue;
        if (!p) {
          // keep sprite out of view until a valid point exists
          spr.visible = false; spr.position.set(0, -9999, 0); continue;
        }
        // ensure sprite visible when we have a point
        spr.visible = true;
        spr.position.set(p.x, p.y, p.z);
          const worldPos = new THREE.Vector3();
        spr.getWorldPosition(worldPos);
        // pulse
        const pulse = 0.03 + Math.abs(Math.sin(state.clock.elapsedTime * 12 + idx)) * 0.045;
        spr.scale.set(pulse, pulse, 1);

        // occlusion: hide if globe intersects ray before sprite
        try {
          const origin = cam.position.clone();
          const dir = worldPos.clone().sub(origin).normalize();
          const oc = origin.clone();
          const r = radius - 0.02;
          const a = dir.dot(dir);
          const b = 2 * dir.dot(oc);
          const c = oc.dot(oc) - r * r;
          const disc = b * b - 4 * a * c;
          let blocked = false;
          if (disc > 0) {
            const sqrtD = Math.sqrt(disc);
            const t1 = (-b - sqrtD) / (2 * a);
            const t2 = (-b + sqrtD) / (2 * a);
            const distToSprite = origin.distanceTo(worldPos);
            const eps = 0.18;
            const tIntersect = t1 > 0 ? t1 : (t2 > 0 ? t2 : null);
            if (tIntersect !== null && tIntersect < distToSprite - eps) blocked = true;
          }
          spr.visible = !blocked;
        } catch (e) {
          spr.visible = true;
        }
      }
    }
  });

  const lineMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#3ee6ff', transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const tubeSegments = 24;

  return (
    <group>
      {curves.map((curve, i) => (
        <group key={i}>
          <mesh>
            <tubeGeometry args={[curve, tubeSegments, 0.02, 6, false]} />
            <meshBasicMaterial color={'#3ee6ff'} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {Array.from({ length: perCurve }).map((_, k) => {
            const idx = i * perCurve + k;
            return (
              <sprite key={idx} ref={(r) => (glowRefs.current[idx] = r)} visible={false}>
                <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} transparent depthWrite={false} depthTest={false} opacity={0.95} />
              </sprite>
            );
          })}
        </group>
      ))}
    </group>
  );
};

function fibonacciSphere(samples: number, radius = 1) {
  const points: THREE.Vector3[] = [];
  const offset = 2 / samples;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = ((i * offset) - 1) + (offset / 2);
    const r = Math.sqrt(1 - Math.pow(y, 2));
    const phi = i * increment;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

function makeCanvasTexture(src?: string, label?: string, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // transparent background
  ctx.clearRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);

  if (src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      // draw circular clipped image
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();
      texture.needsUpdate = true;
    };
    img.onerror = () => {
      // fallback to label
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size * 0.28}px sans-serif`;
      ctx.fillText((label || '').slice(0, 2).toUpperCase(), size / 2, size / 2);
      texture.needsUpdate = true;
    };
  } else {
    // draw circle + initials
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size * 0.28}px sans-serif`;
    ctx.fillText((label || '').slice(0, 2).toUpperCase(), size / 2, size / 2);
    texture.needsUpdate = true;
  }

  return texture;
}

function makeGlowTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(34,211,238,0.9)');
  grad.addColorStop(0.25, 'rgba(34,211,238,0.6)');
  grad.addColorStop(0.6, 'rgba(34,211,238,0.12)');
  grad.addColorStop(1, 'rgba(34,211,238,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,size,size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeStreakTexture(size = 256, color = '255,186,64') {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0,0,size,size);
  // squash transform to draw an elliptical gradient
  ctx.save();
  ctx.translate(size/2, size/2);
  ctx.scale(1.6, 0.6);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
  grad.addColorStop(0, `rgba(${color},0.95)`);
  grad.addColorStop(0.3, `rgba(${color},0.6)`);
  grad.addColorStop(0.7, `rgba(${color},0.12)`);
  grad.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, size/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeStarTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0,0,size,size);
  const cx = size/2;
  const cy = size/2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.2, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size/2, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const Sprites: React.FC<{ positions: THREE.Vector3[]; parentRef: React.RefObject<THREE.Group>; globeRadius: number }> = ({ positions, parentRef, globeRadius }) => {
  // placeholder generator for products without images
  const makePlaceholderDataUrl = (label?: string, size = 256) => {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,size,size);
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath(); ctx.arc(size/2,size/2,size/2-2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${size * 0.28}px sans-serif`;
    ctx.fillText((label||'').slice(0,2).toUpperCase(), size/2, size/2);
    return c.toDataURL();
  };

  // Build source list (prefer local IMAGE_MAP -> product.image -> placeholder)
  const srcs = useMemo(() => PRODUCTS.map((p) => {
    const id = p.id as string;
    const mapped = IMAGE_MAP[id] as string | undefined;
    if (mapped) return mapped;
    const maybe = (p as any).image as string | undefined;
    if (maybe) return maybe;
    return makePlaceholderDataUrl(p.title, 256);
  }), []);

  // load textures via TextureLoader for better quality
  const textures = useLoader(THREE.TextureLoader, srcs as string[]);
  const glowTex = useMemo(() => makeGlowTexture(128), []);

  // improve texture parameters (encoding, anisotropy)
  const { gl } = useThree();
  useEffect(() => {
    try {
      const maxAniso = (gl.capabilities && (gl.capabilities as any).getMaxAnisotropy) ? (gl.capabilities as any).getMaxAnisotropy() : (gl.getMaxAnisotropy ? gl.getMaxAnisotropy() : 1);
      textures.forEach((t) => {
        if (!t) return;
        if ('colorSpace' in t) {
          try { (t as any).colorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding; } catch (e) { (t as any).encoding = (THREE as any).sRGBEncoding || THREE.LinearEncoding; }
        } else {
          (t as any).encoding = (THREE as any).sRGBEncoding || THREE.LinearEncoding;
        }
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        try { if ((t as any).anisotropy !== undefined) (t as any).anisotropy = maxAniso; } catch(e) {}
        t.needsUpdate = true;
      });
      if (glowTex) { glowTex.generateMipmaps = true; glowTex.needsUpdate = true; }
    } catch (e) {
      // ignore
    }
  }, [textures, gl, glowTex]);

  // create circular (bubble) masked textures from loaded images for crisper bubble look
  const processedTextures = useMemo(() => {
    try {
      return textures.map((t) => {
        if (!t || !(t as any).image) return t;
        const img: HTMLImageElement = (t as any).image as HTMLImageElement;
        const size = 256;
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const ctx = c.getContext('2d')!;
        ctx.clearRect(0,0,size,size);
        // circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI*2);
        ctx.closePath();
        ctx.clip();
        // draw image covering the canvas (cover)
        const iw = img.width || size;
        const ih = img.height || size;
        const scale = Math.max(size / iw, size / ih);
        // small per-image adjustment to center the 'cardapio' logo better
        const srcIndex = textures.indexOf(t as any);
        const isCardapio = srcs[srcIndex] === IMAGE_MAP.cardapio;
        const adjScale = isCardapio ? scale * 1.05 : scale;
        const dw = iw * adjScale;
        const dh = ih * adjScale;
        // shift up slightly for cardapio so the top text is visible inside circle
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2 + (isCardapio ? -size * 0.08 : 0);
        try { ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh); } catch(e) { /* ignore draw errors */ }
        ctx.restore();
        // draw circular border (dark bubble outline)
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 6, 0, Math.PI*2);
        ctx.closePath();
        ctx.lineWidth = Math.max(2, Math.floor(size * 0.02));
        ctx.strokeStyle = 'rgba(12,12,14,0.95)';
        ctx.stroke();
        const newTex = new THREE.CanvasTexture(c);
        newTex.generateMipmaps = true;
        if ('colorSpace' in newTex) {
          try { (newTex as any).colorSpace = (THREE as any).SRGBColorSpace || (THREE as any).sRGBEncoding; } catch (e) { (newTex as any).encoding = (THREE as any).sRGBEncoding || THREE.LinearEncoding; }
        } else {
          (newTex as any).encoding = (THREE as any).sRGBEncoding || THREE.LinearEncoding;
        }
        newTex.minFilter = THREE.LinearMipmapLinearFilter;
        newTex.magFilter = THREE.LinearFilter;
        try { (newTex as any).anisotropy = (gl.capabilities && (gl.capabilities as any).getMaxAnisotropy) ? (gl.capabilities as any).getMaxAnisotropy() : 1; } catch(e) {}
        newTex.needsUpdate = true;
        return newTex;
      });
    } catch (e) {
      return textures;
    }
  }, [textures, gl]);

  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);
  const glowRefs = useRef<Array<THREE.Sprite | null>>([]);
  const ghostRefs = useRef<Array<THREE.Sprite | null>>([]);
  const hovered = useRef<number | null>(null);

  useFrame((state, delta) => {
    const cam = state.camera;
    const g = parentRef.current;
    if (!g) return;

    // adjust each sprite scale/opacity based on distance to camera
      for (let i = 0; i < positions.length; i++) {
      const spr = spriteRefs.current[i];
      const glow = glowRefs.current[i];
        const ghost = ghostRefs.current[i];
      if (!spr) continue;
      const worldPos = new THREE.Vector3();
      spr.getWorldPosition(worldPos);
      const dist = cam.position.distanceTo(worldPos);
      // map dist to scale  (close -> larger)
      const min = 4;
      const max = 14;
      const t = Math.min(1, Math.max(0, (dist - min) / (max - min)));
      const baseScale = 1.2 * (1 - t) + 0.75 * t; // slightly smaller, more proportional to globe
      const hoverBoost = hovered.current === i ? 1.25 : 1;
      spr.scale.set(baseScale * hoverBoost, baseScale * hoverBoost, 1);
      // opacity varies with distance
      const mat = spr.material as THREE.SpriteMaterial;
      if (mat) mat.opacity = 0.9 * (1 - t * 0.35);
      // renderOrder so closer draw on top
      (spr as any).renderOrder = Math.round(3000 - dist * 10);

      if (glow) {
        glow.scale.set(baseScale * 1.8 * hoverBoost, baseScale * 1.8 * hoverBoost, 1);
        const gmat = glow.material as THREE.SpriteMaterial;
        if (gmat) gmat.opacity = 0.6 * (1 - t * 0.6) * (hovered.current === i ? 1.2 : 1);
        (glow as any).renderOrder = Math.round(2000 - dist * 10);
      }

        // occlusion test: robust ray-sphere intersection (quadratic) to determine if globe blocks sprite
      try {
        const origin = cam.position.clone();
        const dir = worldPos.clone().sub(origin).normalize();
        const center = new THREE.Vector3(0, 0, 0);
        const oc = origin.clone().sub(center);
        const r = globeRadius - 0.02; // sphere radius slightly smaller to avoid grazing-edge false positives
        const a = dir.dot(dir);
        const b = 2 * dir.dot(oc);
        const c = oc.dot(oc) - r * r;
        const disc = b * b - 4 * a * c;
        let blocked = false;
        if (disc > 0) {
          const sqrtD = Math.sqrt(disc);
          const t1 = (-b - sqrtD) / (2 * a);
          const t2 = (-b + sqrtD) / (2 * a);
          const distToSprite = origin.distanceTo(worldPos);
          const eps = 0.2; // require intersection noticeably before sprite to count as blocked
          // choose smallest positive intersection
          const tIntersect = t1 > 0 ? t1 : (t2 > 0 ? t2 : null);
          if (tIntersect !== null && tIntersect < distToSprite - eps) blocked = true;
        }

        if (blocked) {
          if (spr.material) {
            (spr.material as THREE.SpriteMaterial).opacity = 0.0;
            try { (spr.material as any).depthTest = true; } catch(e) {}
          }
          if (ghost) {
            ghost.visible = true;
            ghost.scale.set(baseScale * 0.9 * hoverBoost, baseScale * 0.9 * hoverBoost, 1);
            const gmat = ghost.material as THREE.SpriteMaterial;
            if (gmat) { gmat.opacity = 0.36; gmat.color.set('#2a2d31'); }
            (ghost as any).renderOrder = Math.round(1500 - dist * 10);
          }
        } else {
          if (spr.material) {
            (spr.material as THREE.SpriteMaterial).opacity = 1.0 * (1 - t * 0.15);
            try { (spr.material as any).depthTest = false; } catch(e) {}
          }
          if (ghost) {
            ghost.visible = false;
          }
        }
      } catch (e) {
        // ignore occlusion errors
      }
    }
  });

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos as any}>
          {/* glow behind */}
          <sprite
            ref={(r) => (glowRefs.current[i] = r)}
            onPointerOver={(e) => { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; }}
            scale={[2.1, 2.1, 1]}
          >
            <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} transparent depthWrite={false} depthTest={false} opacity={0.65} />
          </sprite>

          {/* ghost (dim) copy shown when sprite is occluded by globe */}
          <sprite
            ref={(r) => (ghostRefs.current[i] = r)}
            visible={false}
            scale={[1.0, 1.0, 1]}
          >
            <spriteMaterial map={processedTextures[i] || textures[i]} transparent depthWrite={false} depthTest={false} opacity={0.36} color={'#2a2d31'} />
          </sprite>

          <sprite
            ref={(r) => (spriteRefs.current[i] = r)}
            onClick={() => { const p = PRODUCTS[i]; if (p && p.href) window.open(p.href, '_blank', 'noopener'); }}
            onPointerUp={() => { /* ensure pointer gesture opens in some browsers */ const p = PRODUCTS[i]; if (p && p.href) window.open(p.href, '_blank', 'noopener'); }}
            onPointerOver={(e) => { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; }}
            scale={[0.9, 0.9, 1]}
          >
            <spriteMaterial map={processedTextures[i] || textures[i]} transparent depthWrite={false} depthTest={true} alphaTest={0.01} />
          </sprite>
        </group>
      ))}
    </>
  );
};

const GlobeApps: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ down: false, x: 0, y: 0 });
  const groupRef = useRef<THREE.Group | null>(null);

  // responsive viewport tracking
  const [viewportW, setViewportW] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // responsive sizes based on viewport width
  const globeRadius = viewportW < 640 ? 1.6 : viewportW < 1024 ? 2.0 : GLOBE_RADIUS_DEFAULT;
  const TOP_EXTEND = viewportW < 640 ? 28 : TOP_EXTEND_DEFAULT;
  const BOTTOM_EXTEND = viewportW < 640 ? 20 : BOTTOM_EXTEND_DEFAULT;
  // slightly reduce base height to make the particle/canvas area a bit smaller
  const baseHeight = viewportW < 640 ? 360 : 480;

  const positions = useMemo(() => fibonacciSphere(PRODUCTS.length, globeRadius), [globeRadius]);

  // Pointer handlers to rotate the group and inertia
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // mount debug log removed for production readiness
    let lastX = 0;
    let lastY = 0;
    let vx = 0;
    let vy = 0;

    const pointerScale = viewportW < 640 ? 0.025 : 0.01;

    function onDown(e: PointerEvent) {
      // only start dragging if pointer is inside the canvas area
      try {
        const el = wrapperRef.current;
        const canvas = el ? (el.querySelector('canvas') as HTMLCanvasElement | null) : null;
        if (canvas) {
          const r = canvas.getBoundingClientRect();
          // only start drag when touching inside a centered circular zone over the globe
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // radius threshold (45% of smaller canvas dimension)
          const threshold = Math.min(r.width, r.height) * 0.45;
          if (dist > threshold) return; // outside globe touch zone -> allow page scroll
        }
      } catch (err) {
        // if any error, fall back to allowing drag
      }
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
      dragRef.current.down = true;
      lastX = e.clientX;
      lastY = e.clientY;
      // prevent native scrolling while dragging
      try { e.preventDefault(); } catch {}
    }
    function onMove(e: PointerEvent) {
      if (!dragRef.current.down) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      vx = dx * pointerScale;
      vy = dy * pointerScale;
      const g = groupRef.current;
      if (g) {
        g.rotation.y += vx;
        g.rotation.x += vy;
      }
      try { e.preventDefault(); } catch {}
    }
    function onUp(e: PointerEvent) {
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
      dragRef.current.down = false;
      // inertia
      const g = groupRef.current;
      if (g) {
        const id = setInterval(() => {
          vx *= 0.95;
          vy *= 0.95;
          g.rotation.y += vx;
          g.rotation.x += vy;
          if (Math.abs(vx) < 0.0005 && Math.abs(vy) < 0.0005) clearInterval(id);
        }, 16);
      }
    }

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Auto-rotate when not dragging: implement inside Canvas via a small helper component
  const AutoRotate: React.FC = () => {
    useFrame((state, delta) => {
      const g = groupRef.current;
      if (!g) return;
      // don't auto-rotate while dragging
      if ((dragRef.current && dragRef.current.down)) return;
      g.rotation.y += 0.12 * delta;
      g.rotation.x += 0.01 * delta;
    });
    return null;
  };

  const containerHeight = baseHeight + TOP_EXTEND + BOTTOM_EXTEND;

  return (
    <div ref={wrapperRef} style={{ width: '100%', minHeight: 360, height: `calc(${containerHeight}px + 2cm)`, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 20, overflow: 'visible', touchAction: 'none', userSelect: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: '#071b39', position: 'relative', zIndex: 5, width: '100%', height: '100%', transform: `translateY(calc(-${TOP_EXTEND}px + 2cm))`, touchAction: 'none' }}>
        <hemisphereLight skyColor={0x202033} groundColor={0x08060a} intensity={0.25} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />

        {/* Stars background */}
        <StarsBackground />

        <AutoRotate />
        <group ref={groupRef}>
            {/* connections particles (moved inside group so they rotate with the globe) */}
            <Connections positions={positions} radius={globeRadius} />
            {/* Dark globe body */}
            <mesh>
              <sphereGeometry args={[globeRadius, 64, 64]} />
              <meshStandardMaterial color={'#06060a'} metalness={0.15} roughness={0.8} emissive={'#020214'} emissiveIntensity={0.05} />
            </mesh>

            {/* subtle wireframe overlay */}
            <mesh>
              <sphereGeometry args={[globeRadius + 0.03, 32, 32]} />
              <meshBasicMaterial color={'#6d28d9'} wireframe opacity={0.06} transparent />
            </mesh>

          <Sprites positions={positions} parentRef={groupRef} globeRadius={globeRadius} />

          {/* debug fallback removed for final visuals */}
        </group>
      </Canvas>
      {/* title overlay above the particle/canvas layer (matches site headings; does not block pointer events) */}
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900" style={{ position: 'absolute', top: 'calc(-84px + 1cm)', left: '50%', transform: 'translateX(-50%)', color: undefined, textShadow: '0 4px 12px rgba(255,255,255,0.6)', zIndex: 50, pointerEvents: 'none' }}>
        Gire o globo e veja nossos apps
      </h2>
    </div>
  );
};

export default GlobeApps;
