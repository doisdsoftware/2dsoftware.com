import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// enable three.js cache so preloaded textures are reused by TextureLoader / useLoader
(THREE as any).Cache.enabled = true;
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
  // increase star count so small particles are more visible
  const count = 600;
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
        <pointsMaterial ref={matRef as any} vertexColors size={1.2} sizeAttenuation color={0xffffff} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
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

  // multiple moving star sprites per curve for density (increased slightly)
  const perCurve = 6; // number of moving stars per curve
  const totalSprites = curves.length * perCurve;
  const glowRefs = useRef<Array<THREE.Sprite | null>>([]);
  const glowStates = useRef<number[]>([]);
  const glowSpeeds = useRef<number[]>([]);

  // initialize or resize glow arrays when curves change
  useEffect(() => {
    const newTotal = curves.length * perCurve;
    glowRefs.current = new Array(newTotal).fill(null);
    glowStates.current = new Array(newTotal).fill(0).map(() => Math.random());
    // restore moderate speed; we'll position sprites immediately so they appear faster
    glowSpeeds.current = new Array(newTotal).fill(0).map(() => 0.18 + Math.random() * 0.6);

    // Try to place sprites on their curves immediately so they are visible on mount
    // (some Sprite refs may not yet be attached; guard accordingly)
    for (let ci = 0; ci < curves.length; ci++) {
      const curve = curves[ci];
      for (let k = 0; k < perCurve; k++) {
        const idx = ci * perCurve + k;
        const spr = glowRefs.current[idx];
        try {
          const u = glowStates.current[idx] ?? Math.random();
          if (spr && curve && typeof (curve as any).getPointAt === 'function') {
            const p = (curve as any).getPointAt(u);
            spr.position.set(p.x, p.y, p.z);
            spr.visible = true;
            // small initial scale so they don't pop too large
            spr.scale.set(0.02, 0.02, 1);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [curves.length]);

  // Ensure sprites become visible as soon as their refs are attached.
  // Some sprite refs are null during first render; poll for a short while using rAF.
  useEffect(() => {
    let rafId: number | null = null;
    let attempts = 0;
    const maxAttempts = 120; // try for ~2s at 60fps

    function initLoop() {
      let pending = false;
      for (let ci = 0; ci < curves.length; ci++) {
        const curve = curves[ci];
        for (let k = 0; k < perCurve; k++) {
          const idx = ci * perCurve + k;
          const spr = glowRefs.current[idx];
          if (!spr) { pending = true; continue; }
          // mark-initialized to avoid re-initializing
          if ((spr as any).__inited) continue;
          try {
            const u = glowStates.current[idx] ?? Math.random();
            if (curve && typeof (curve as any).getPointAt === 'function') {
              const p = (curve as any).getPointAt(u);
              spr.position.set(p.x, p.y, p.z);
              spr.visible = true;
              spr.scale.set(0.03, 0.03, 1);
              (spr as any).__inited = true;
            }
          } catch (e) { /* ignore init errors */ }
        }
      }

      attempts++;
      if (pending && attempts < maxAttempts) {
        rafId = requestAnimationFrame(initLoop);
      }
    }

    initLoop();
    return () => { if (rafId) cancelAnimationFrame(rafId); };
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

        // occlusion + hemisphere test: hide sprite when it's on globe's far side or when
        // the globe intersects the ray from camera to sprite before the sprite point.
        try {
          const origin = cam.position.clone();
          const worldNorm = worldPos.clone().normalize();
          const camDir = origin.clone().normalize();
          let blocked = false;
          // hemisphere check: if dot < 0 it's roughly on opposite hemisphere
          const faceDot = camDir.dot(worldNorm);
          if (faceDot < 0.05) blocked = true;

          if (!blocked) {
            const dir = worldPos.clone().sub(origin).normalize();
            const oc = origin.clone();
            const r = radius - 0.02;
            const a = dir.dot(dir);
            const b = 2 * dir.dot(oc);
            const c = oc.dot(oc) - r * r;
            const disc = b * b - 4 * a * c;
            if (disc > 0) {
              const sqrtD = Math.sqrt(disc);
              const t1 = (-b - sqrtD) / (2 * a);
              const t2 = (-b + sqrtD) / (2 * a);
              const distToSprite = origin.distanceTo(worldPos);
              const eps = 0.18;
              const tIntersect = t1 > 0 ? t1 : (t2 > 0 ? t2 : null);
              if (tIntersect !== null && tIntersect < distToSprite - eps) blocked = true;
            }
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
            <meshBasicMaterial color={'#ffffff'} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
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
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
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

const Sprites: React.FC<{ positions: THREE.Vector3[]; parentRef: React.RefObject<THREE.Group>; globeRadius: number; preloadedTextures?: THREE.Texture[] | null; onHover?: (idx: number | null, client?: { x: number; y: number } | null) => void }> = ({ positions, parentRef, globeRadius, preloadedTextures, onHover }) => {
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
      const arr = (activeTextures as any) || textures;
      arr.forEach((t: any) => {
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
  }, [textures, gl, glowTex, preloadedTextures]);

    // If an external preloaded textures array was attached to the textures via THREE.Cache,
    // prefer those when present. (Three Cache is enabled globally.)

  // prefer preloaded textures when passed from parent (faster visibility)
  const activeTextures = preloadedTextures && preloadedTextures.length === srcs.length ? preloadedTextures : textures;

  // create circular (bubble) masked textures from loaded images for crisper bubble look
  const processedTextures = useMemo(() => {
    try {
      return (activeTextures as any).map((t: THREE.Texture) => {
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
        const isDelivery = srcs[srcIndex] === IMAGE_MAP.delivery;
        // reduce zoom for cardapio and delivery so contents fit better (zoom out)
        // cardapio: more zoomed out to show text; delivery: slightly zoomed out to show hamburger
        const adjScale = isCardapio ? scale * 0.45 : isDelivery ? scale * 0.85 : scale;
        const dw = iw * adjScale;
        const dh = ih * adjScale;
        // small vertical adjustments to better frame contents
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2 + (isCardapio ? -size * 0.03 : isDelivery ? -size * 0.03 : 0);
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
  }, [textures, gl, activeTextures]);

  const spriteRefs = useRef<Array<THREE.Sprite | null>>([]);
  const glowRefs = useRef<Array<THREE.Sprite | null>>([]);
  const ghostRefs = useRef<Array<THREE.Sprite | null>>([]);
  const blockedRef = useRef<boolean[]>([]);
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
      const isMobile = (typeof window !== 'undefined' && window.innerWidth < 640);
      const mobileFactor = isMobile ? 0.65 : 1; // reduce bubble size on mobile
      const isHovered = hovered.current === i && !blockedRef.current[i];
      const hoverBoost = isHovered ? 1.35 : 1; // subtler 3D zoom when hovered
      spr.scale.set(baseScale * mobileFactor * hoverBoost, baseScale * mobileFactor * hoverBoost, 1);
      // opacity varies with distance
      const mat = spr.material as THREE.SpriteMaterial;
      if (mat) mat.opacity = 0.9 * (1 - t * 0.35);
      // renderOrder so closer draw on top
      (spr as any).renderOrder = Math.round(3000 - dist * 10);

      if (glow) {
        glow.scale.set(baseScale * mobileFactor * 1.8 * hoverBoost, baseScale * mobileFactor * 1.8 * hoverBoost, 1);
        const gmat = glow.material as THREE.SpriteMaterial;
        if (gmat) gmat.opacity = 0.6 * (1 - t * 0.6) * (hovered.current === i ? 1.2 : 1);
        (glow as any).renderOrder = Math.round(2000 - dist * 10);
      }

      // 3D pop: move sprite forward along local z when hovered to create depth
      try {
        const targetZ = isHovered ? Math.max(0.06, globeRadius * 0.03) : 0;
        // sprites are children of a group positioned on the sphere; animate local z
        const curZ = spr.position.z || 0;
        spr.position.z = curZ + (targetZ - curZ) * 0.18;
        if (ghost) {
          const gCurZ = ghost.position.z || 0;
          ghost.position.z = gCurZ + ( (isHovered ? targetZ * 0.9 : 0) - gCurZ) * 0.18;
        }
      } catch (e) {}

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

        // also consider hemisphere (back of globe) as blocked
        try {
          const camDir = cam.position.clone().normalize();
          const pNorm = worldPos.clone().normalize();
          const faceDot = camDir.dot(pNorm);
          if (faceDot < 0.12) blocked = true;
        } catch (e) {}

        // store blocked state for use by handlers
        try { blockedRef.current[i] = blocked; } catch (e) {}

        if (blocked) {
          if (spr.material) {
            (spr.material as THREE.SpriteMaterial).opacity = 0.0;
            try { (spr.material as any).depthTest = true; } catch(e) {}
          }
          if (ghost) {
            ghost.visible = true;
            ghost.scale.set(baseScale * mobileFactor * 0.9 * hoverBoost, baseScale * mobileFactor * 0.9 * hoverBoost, 1);
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
            onPointerDown={(e) => { if (!blockedRef.current[i]) { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
            onPointerOver={(e) => { if (!blockedRef.current[i]) { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
            onPointerOut={(e) => { if (!blockedRef.current[i]) { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; onHover && onHover(null, null); } }}
            onPointerCancel={(e) => { if (!blockedRef.current[i]) { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; onHover && onHover(null, null); } }}
            onPointerMove={(e) => { if (!blockedRef.current[i]) { onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
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
            <spriteMaterial map={(processedTextures as any)[i] || (activeTextures as any)[i]} transparent depthWrite={false} depthTest={false} opacity={0.36} color={'#2a2d31'} />
          </sprite>

          <sprite
            ref={(r) => (spriteRefs.current[i] = r)}
            onClick={() => { if (blockedRef.current[i]) return; const p = PRODUCTS[i]; if (p && p.href) window.open(p.href, '_blank', 'noopener'); hovered.current = null; onHover && onHover(null, null); }}
            onPointerDown={(e) => { if (!blockedRef.current[i]) { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
            onPointerUp={(e) => { if (blockedRef.current[i]) return; /* ensure pointer gesture opens in some browsers */ const p = PRODUCTS[i]; if (p && p.href) window.open(p.href, '_blank', 'noopener'); hovered.current = null; onHover && onHover(null, null); }}
            onPointerOver={(e) => { if (!blockedRef.current[i]) { hovered.current = i; e.stopPropagation(); document.body.style.cursor = 'pointer'; onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
            onPointerOut={(e) => { if (!blockedRef.current[i]) { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; onHover && onHover(null, null); } }}
            onPointerCancel={(e) => { if (!blockedRef.current[i]) { hovered.current = null; e.stopPropagation(); document.body.style.cursor = 'default'; onHover && onHover(null, null); } }}
            onPointerMove={(e) => { if (!blockedRef.current[i]) { onHover && onHover(i, { x: (e as any).clientX, y: (e as any).clientY }); } }}
            scale={[0.9, 0.9, 1]}
          >
            <spriteMaterial map={(processedTextures as any)[i] || (activeTextures as any)[i]} transparent depthWrite={false} depthTest={true} alphaTest={0.01} />
          </sprite>
        </group>
      ))}
    </>
  );
};

const GlobeApps: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ down: false, x: 0, y: 0 });
  const cameraRef = useRef<THREE.Camera | null>(null);
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

  // Preloaded THREE.Textures to speed sprite visibility
  const [preloadedTextures, setPreloadedTextures] = useState<THREE.Texture[] | null>(null);

  // Preload product images/textures to speed up sprite initialization and create THREE.Textures
  useEffect(() => {
    try {
      const urls: string[] = [];
      PRODUCTS.forEach((p: any) => { if (p.id && p.image) urls.push(p.image); });
      try { Object.values(IMAGE_MAP).forEach((v) => urls.push(v)); } catch (e) {}
      const texLoader = new THREE.TextureLoader();
      const loaded: THREE.Texture[] = [];
      let pending = urls.length;
      if (pending === 0) { setPreloadedTextures([]); return; }
      urls.forEach((u, idx) => {
        try { const img = new Image(); img.src = u; } catch (e) {}
        try {
          texLoader.load(u, (tex) => {
            try {
              tex.generateMipmaps = true;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.needsUpdate = true;
            } catch (e) {}
            loaded[idx] = tex;
            pending--; if (pending <= 0) setPreloadedTextures(loaded.slice(0, urls.length));
          }, undefined, () => { pending--; if (pending <= 0) setPreloadedTextures(loaded.slice(0, urls.length)); });
        } catch (e) { pending--; if (pending <= 0) setPreloadedTextures(loaded.slice(0, urls.length)); }
      });
    } catch (e) {}
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

  // component to capture the Canvas camera instance
  const SetCameraRef: React.FC = () => {
    const { camera } = useThree();
    useEffect(() => { cameraRef.current = camera; return () => { cameraRef.current = null; }; }, [camera]);
    return null;
  };

  const containerHeight = baseHeight + TOP_EXTEND + BOTTOM_EXTEND;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  // Improve mobile behavior: allow page scrolling when touching outside the canvas
  // and make the canvas capture pointer events only when the pointer is over it.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    // attach pointerdown only to the Canvas element so touches on the dark background
    // keep their native scrolling behavior. Moves and up are tracked globally but only
    // applied while dragging started on the canvas.
    const canvas = el.querySelector('canvas');
    let vx = 0; let vy = 0;
    const dragRefLocal = dragRef.current;

    function onDown(e: PointerEvent) {
      if (!canvas) return;
      try {
        const r = canvas.getBoundingClientRect();
        // If we have the three camera, compute a precise projected screen radius for the globe
        if (cameraRef.current) {
          const cam = cameraRef.current;
          // project multiple sphere edge sample points to get a conservative pixel radius
          const samples = [
            new THREE.Vector3(globeRadius, 0, 0),
            new THREE.Vector3(-globeRadius, 0, 0),
            new THREE.Vector3(0, globeRadius, 0),
            new THREE.Vector3(0, -globeRadius, 0),
            new THREE.Vector3(0, 0, globeRadius),
            new THREE.Vector3(0, 0, -globeRadius),
          ];
          const vCenter = new THREE.Vector3(0, 0, 0).project(cam);
          const cx = r.left + (vCenter.x + 1) * 0.5 * r.width;
          const cy = r.top + (-vCenter.y + 1) * 0.5 * r.height;
          let maxDist = 0;
          samples.forEach((s) => {
            const p = s.clone().project(cam);
            const px = r.left + (p.x + 1) * 0.5 * r.width;
            const py = r.top + (-p.y + 1) * 0.5 * r.height;
            const d = Math.hypot(px - cx, py - cy);
            if (d > maxDist) maxDist = d;
          });
          const radiusPx = maxDist;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          // add multiplier padding to be more forgiving on mobile fingers
          if (dist > radiusPx * 1.25) return;
        } else {
          // fallback: use bounding-box threshold
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > Math.min(r.width, r.height) * 1.25) return;
        }
      } catch (err) {
        return;
      }
      dragRefLocal.down = true;
      dragRefLocal.lastX = e.clientX;
      dragRefLocal.lastY = e.clientY;
      dragRefLocal.isTouch = e.pointerType === 'touch';
      try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
    }

    function onMove(e: PointerEvent) {
      if (!dragRefLocal.down) return;
      const dx = e.clientX - (dragRefLocal.lastX || 0);
      const dy = e.clientY - (dragRefLocal.lastY || 0);
      dragRefLocal.lastX = e.clientX;
      dragRefLocal.lastY = e.clientY;
      // increase sensitivity on touch so mobile swipes rotate the globe responsively
      const sensitivity = dragRefLocal.isTouch ? 0.018 : 0.01;
      vx = dx * sensitivity;
      vy = dy * sensitivity;
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

    if (canvas) canvas.addEventListener('pointerdown', onDown);
    if (el) el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      if (canvas) canvas.removeEventListener('pointerdown', onDown);
      if (el) el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div id="ecossistema" ref={wrapperRef} style={{ width: '100%', minHeight: 360, height: `calc(${containerHeight}px + 2cm)`, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 20, overflow: 'visible', touchAction: 'pan-y', userSelect: 'none' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: '#071b39', position: 'relative', zIndex: 5, width: '100%', height: '100%', transform: `translateY(calc(-${TOP_EXTEND}px + 2cm))`, touchAction: 'pan-y' }}>
        <SetCameraRef />
        <hemisphereLight skyColor={0x202033} groundColor={0x08060a} intensity={0.25} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />

        {/* Stars background and auto-rotate helper */}
        <StarsBackground />
        <AutoRotate />

        <group ref={groupRef}>
          {/* connections particles (moved inside group so they rotate with the globe) */}
          <Connections positions={positions} radius={globeRadius} />

          {/* Dark globe body */}
          <mesh
            onPointerDown={(e: any) => {
              try { e.stopPropagation(); } catch {}
              dragRef.current.down = true;
              dragRef.current.lastX = (e.clientX ?? e.nativeEvent?.clientX) || 0;
              dragRef.current.lastY = (e.clientY ?? e.nativeEvent?.clientY) || 0;
              dragRef.current.isTouch = e.pointerType === 'touch' || (e.nativeEvent && e.nativeEvent.pointerType === 'touch');
              try { (e.target as Element).setPointerCapture?.(e.pointerId ?? (e.nativeEvent && e.nativeEvent.pointerId)); } catch {}
            }}
            onPointerUp={(e: any) => {
              try { e.stopPropagation(); } catch {}
              try { (e.target as Element).releasePointerCapture?.(e.pointerId ?? (e.nativeEvent && e.nativeEvent.pointerId)); } catch {}
              dragRef.current.down = false;
            }}
          >
            <sphereGeometry args={[globeRadius, 64, 64]} />
            <meshStandardMaterial color={'#06060a'} metalness={0.15} roughness={0.8} emissive={'#020214'} emissiveIntensity={0.05} />
          </mesh>

          {/* subtle wireframe overlay */}
          <mesh>
            <sphereGeometry args={[globeRadius + 0.03, 32, 32]} />
            <meshBasicMaterial color={'#6d28d9'} wireframe opacity={0.06} transparent />
          </mesh>

          <Sprites positions={positions} parentRef={groupRef} globeRadius={globeRadius} preloadedTextures={preloadedTextures} onHover={(i, client) => { setHoveredIdx(i); setHoverPos(client || null); }} />

        </group>
      </Canvas>

      {/* title: desktop uses original dark heading; mobile shows single-line variation */}
      {viewportW < 640 ? (
        <h2 className="font-bold text-center text-slate-900" style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', textShadow: '0 4px 12px rgba(0,0,0,0.45)', zIndex: 80, pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '90%', fontSize: '20px', lineHeight: '1' }}>
          Gire o globo e veja nossos apps
        </h2>
      ) : (
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900" style={{ position: 'absolute', top: 'calc(-84px + 1cm)', left: '50%', transform: 'translateX(-50%)', textShadow: '0 4px 12px rgba(255,255,255,0.6)', zIndex: 50, pointerEvents: 'none' }}>
          Gire o globo e veja nossos apps
        </h2>
      )}
      {/* tooltip overlay for hovered sprites */}
      {hoveredIdx !== null && hoverPos && PRODUCTS[hoveredIdx] && (
        <div style={{ position: 'absolute', left: hoverPos.x + 12, top: hoverPos.y + 12, pointerEvents: 'none', zIndex: 60 }}>
          <div className="bg-slate-900 text-white text-sm px-3 py-1 rounded-md shadow-lg">{PRODUCTS[hoveredIdx].title}</div>
        </div>
      )}
    </div>
  );
};

export default GlobeApps;
