import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AppNode {
  id: string;
  name: string;
  href?: string;
  status?: string;
  imgSrc?: string;
}

const PRINTS = [
  new URL('../prints/001_home.png', import.meta.url).href,
  new URL('../prints/002_products.png', import.meta.url).href,
  new URL('../prints/003_admin_overview.png', import.meta.url).href,
  new URL('../prints/006_admin_orders.png', import.meta.url).href,
  new URL('../prints/007_admin_reports.png', import.meta.url).href,
];

const LOGO_PNG = new URL('../logo/ChatGPT Image 14 de fev. de 2026, 19_14_24.png', import.meta.url).href;

const LOGO_CARDAPIO = new URL('../logo/App cardapio.png', import.meta.url).href;
const LOGO_DELIVERY = new URL('../logo/App delivery.png', import.meta.url).href;
const LOGO_EXPLORER = new URL('../logo/logo app city explorer.png', import.meta.url).href;
const LOGO_FIDELIDADE = new URL('../logo/Logo app fidelidade.png', import.meta.url).href;
const LOGO_AGENDAI = new URL('../logo/Logo AgendAI.png', import.meta.url).href;

const APPS: AppNode[] = [
  { id: 'delivery', name: 'App Delivery', href: 'https://gemini-burgueroficial.vercel.app/', status: 'Ativo', imgSrc: LOGO_DELIVERY } as any,
  { id: 'explorer', name: 'City Explorer', href: 'https://cityexplorer.2dsoftware.com.br/', status: 'Ativo', imgSrc: LOGO_EXPLORER } as any,
  { id: 'fidelidade', name: 'App Fidelidade', href: 'https://appfidelidade-production.up.railway.app/', status: 'Em desenvolvimento', imgSrc: LOGO_FIDELIDADE } as any,
  { id: 'cardapio', name: 'App Cardápio', href: 'https://appcardapio-production.up.railway.app/', status: 'Em desenvolvimento', imgSrc: LOGO_CARDAPIO } as any,
  { id: 'agendai', name: 'App AgendAI', href: 'https://agend-ai-jade.vercel.app/', status: 'Em desenvolvimento', imgSrc: LOGO_AGENDAI } as any,
  { id: 'dashboard', name: 'Dashboard', href: '#dashboard', status: 'Futuro' },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const EcossistemaParticulas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointer = useRef({ x: -9999, y: -9999, down: false });
  const [selected, setSelected] = useState<AppNode | null>(null);
  const [hovered, setHovered] = useState<AppNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const hoveredRef = useRef<any>(null);

  // particles and nodes stored in refs for perf
  const stateRef = useRef<any>({ particles: [], nodes: [] });

  const init = useCallback((w: number, h: number, dpr: number) => {
    const particles: any[] = [];
    const nodes: any[] = [];

    // remove any existing anchor elements from previous init
    try {
      const prev = stateRef.current.nodes || [];
      for (let pn of prev) {
        if (pn && pn.anchor && pn.anchor.remove) pn.anchor.remove();
      }
    } catch (e) { /* ignore */ }

    const smallCount = Math.round((w * h) / 9000); // increased density for more particles moving around
    for (let i = 0; i < smallCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        // stronger horizontal velocity so particles travel left-right
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.8,
      });
    }

    // Place app nodes roughly evenly
    const margin = 80;
    APPS.forEach((app, i) => {
      const angle = (i / APPS.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.28;
      const cx = w / 2 + Math.cos(angle) * radius;
      const cy = h / 2 + Math.sin(angle) * radius * 0.7;
      // increase default bubble size: larger multiplier and higher cap
      let baseR = Math.max(10, Math.min(64, Math.min(w, h) * 0.05));
      // make AgendAI bubble slightly larger to improve hit area
      if ((app as any).id === 'agendai') baseR = Math.round(baseR * 1.35);
      // slightly enlarge bubbles near the left/right edges (increased multiplier)
      const sideThreshold = Math.min(w, 220) * 0.18; // threshold in px relative to width
      if (Math.abs(cx - w * 0) < sideThreshold || Math.abs(cx - w) < sideThreshold || cx < w * 0.18 || cx > w * 0.82) {
        baseR = Math.round(baseR * 1.25);
      }
      const imgSrc = (app as any).imgSrc ?? PRINTS[i] ?? LOGO_PNG;
      const img = new Image();
      img.src = imgSrc;
      const node: any = { ...app, x: cx, y: cy, vx: 0, vy: 0, r: baseR, baseR, img, imgSrc, baseX: cx, baseY: cy, phase: Math.random() * Math.PI * 2 };
      // allow image to load asynchronously
      img.onload = () => { node.img = img; };
      // create a DOM anchor overlay for reliable clicks
      try {
        const a = document.createElement('a');
        a.href = node.href ?? '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.position = 'fixed';
        a.style.left = '0px';
        a.style.top = '0px';
        a.style.width = `${baseR * 2}px`;
        a.style.height = `${baseR * 2}px`;
        a.style.borderRadius = '50%';
        a.style.background = 'transparent';
        a.style.zIndex = '9999';
        a.style.pointerEvents = 'auto';
        a.style.touchAction = 'none';
        (a.style as any).webkitTapHighlightColor = 'transparent';
        a.dataset.appId = node.id;

        // keep tooltip active while pointer is over the anchor
        a.addEventListener('pointerenter', (ev: PointerEvent) => {
          try {
            setHovered(node);
            setHoverPos({ x: ev.clientX + 12, y: ev.clientY + 12 });
            // update canvas pointer position so particles respond while over anchor
            const c = canvasRef.current;
            if (!c) return;
            const canvasRect = c.getBoundingClientRect();
            pointer.current.x = ev.clientX - canvasRect.left;
            pointer.current.y = ev.clientY - canvasRect.top;
          } catch (e) {}
        });
        a.addEventListener('pointermove', (ev: PointerEvent) => {
          try {
            setHoverPos({ x: ev.clientX + 12, y: ev.clientY + 12 });
            const c = canvasRef.current;
            if (!c) return;
            const canvasRect = c.getBoundingClientRect();
            pointer.current.x = ev.clientX - canvasRect.left;
            pointer.current.y = ev.clientY - canvasRect.top;
          } catch (e) {}
        });
        a.addEventListener('pointerleave', () => {
          try {
            setHovered(null);
            setHoverPos(null);
            pointer.current.x = -9999;
            pointer.current.y = -9999;
          } catch (e) {}
        });

        document.body.appendChild(a);
        node.anchor = a;
      } catch (e) {
        // ignore DOM errors (SSR or restricted env)
      }
      nodes.push(node);
    });

    // debug: log nodes created so we can inspect hrefs/imgs
    try {
      console.debug('Ecossistema nodes:', nodes.map((n: any) => ({ id: n.id, name: n.name, href: n.href, imgSrc: n.imgSrc, x: Math.round(n.x), y: Math.round(n.y), r: Math.round(n.r) })));
      const a = nodes.find((n: any) => n.id === 'agendai');
      if (a) console.debug('AgendAI node debug:', { id: a.id, r: a.r, x: Math.round(a.x), y: Math.round(a.y), href: a.href });
    } catch (e) {
      console.debug('Ecossistema nodes (fallback) - could not map nodes');
    }

    stateRef.current = { particles, nodes, w, h, dpr };
  }, []);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {

    const canvas = canvasRef.current!;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    let mounted = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init(rect.width, rect.height, dpr);
    };

    // initial resize and robust observers/listeners for mobile sizing quirks
    const ro: any = (window as any).ResizeObserver ? new (window as any).ResizeObserver(resize) : null;
    resize();
    // ensure resize runs after paint and as a fallback
    requestAnimationFrame(resize);
    const resizeTimeout = window.setTimeout(resize, 150);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

    const maxLink = 110; // connection distance
    const repelRadius = 160;

    const step = () => {
      if (!mounted) return;
      const s = stateRef.current;
      const { particles, nodes } = s;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

        // if a node is hovered (via anchors or detection), force pointer to that node center
        try {
          const hv = hoveredRef.current;
          if (hv && hv.x != null && hv.y != null) {
            pointer.current.x = hv.x;
            pointer.current.y = hv.y;
          }
        } catch (e) { /* ignore */ }

      // update particles
      for (let p of particles) {
        // mouse interaction
        const dx = p.x - pointer.current.x;
        const dy = p.y - pointer.current.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius * 0.6;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        // integrate
        p.x += p.vx;
        p.y += p.vy;

        // gentle damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // horizontal bounce so particles go from one side to the other
        if (p.x < p.r) {
          p.x = p.r;
          p.vx = Math.abs(p.vx) || 0.2;
        } else if (p.x > w - p.r) {
          p.x = w - p.r;
          p.vx = -Math.abs(p.vx) || -0.2;
        }

        // vertical bounce: keep particles visible and invert vertical velocity on edges
        if (p.y < p.r) {
          p.y = p.r;
          p.vy = Math.abs(p.vy) || 0.15;
        } else if (p.y > h - p.r) {
          p.y = h - p.r;
          p.vy = -Math.abs(p.vy) || -0.15;
        }
      }

      // update nodes (app particles) with spring force, separation and gentle drift
      const t = performance.now() / 1000;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - pointer.current.x;
        const dy = n.y - pointer.current.y;
        const dist = Math.hypot(dx, dy) || 1;

        // pointer repulsion (existing behavior)
        if (dist < repelRadius * 1.1) {
          const f = (repelRadius * 1.1 - dist) / (repelRadius * 1.1) * 0.8;
          n.vx += (dx / dist) * f * 0.3;
          n.vy += (dy / dist) * f * 0.3;
        }

        // spring force back to base position (centering)
        const k = 0.014; // stiffness
        n.vx += (n.baseX - n.x) * k;
        n.vy += (n.baseY - n.y) * k;

        // gentle autonomous drift for organic motion
        const driftAmp = Math.max(0.02, Math.min(0.6, Math.min(w, h) * 0.00008));
        n.vx += Math.sin(t * 0.6 + n.phase) * driftAmp;
        n.vy += Math.cos(t * 0.7 + n.phase) * driftAmp * 0.9;

        // separation from other nodes to avoid overlap
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const m = nodes[j];
          const dxm = n.x - m.x;
          const dym = n.y - m.y;
          const d = Math.hypot(dxm, dym) || 1;
          const minDist = n.r + m.r + 6;
          if (d < minDist && d > 0.001) {
            const push = (minDist - d) * 0.02;
            n.vx += (dxm / d) * push;
            n.vy += (dym / d) * push;
          }
        }

        // integrate
        n.x += n.vx;
        n.y += n.vy;

        // damping
        n.vx *= 0.86;
        n.vy *= 0.86;

        // velocity clamp
        const maxV = 2.2;
        if (Math.abs(n.vx) > maxV) n.vx = (n.vx > 0 ? 1 : -1) * maxV;
        if (Math.abs(n.vy) > maxV) n.vy = (n.vy > 0 ? 1 : -1) * maxV;

        // keep within bounds gently
        n.x = clamp(n.x, 40, w - 40);
        n.y = clamp(n.y, 40, h - 40);
      }

      // draw
      ctx.clearRect(0, 0, w, h);

      // background
      ctx.fillStyle = '#03040a';
      ctx.fillRect(0, 0, w, h);

      // draw connections between particles (soft neon)
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = dx * dx + dy * dy;
          if (d < maxLink * maxLink) {
            const dist = Math.sqrt(d);
            const alpha = clamp(1 - dist / maxLink, 0, 1) * 0.55;
            ctx.strokeStyle = `rgba(255,255,255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw connections from particles to nodes when close
      for (let p of particles) {
        for (let n of nodes) {
          const dx = p.x - n.x;
          const dy = p.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 220 * 220) {
            const dist = Math.sqrt(d2);
            const a = clamp(1 - dist / 220, 0, 0.85) * 0.4;
            ctx.strokeStyle = `rgba(255,255,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (let p of particles) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // draw nodes (bigger, glowing, with images)
      for (let n of nodes) {
        // growth when pointer near
        const dx = n.x - pointer.current.x;
        const dy = n.y - pointer.current.y;
        const dist = Math.hypot(dx, dy) || 1;
        const hover = dist < 90;
        const targetR = hover ? n.baseR * 1.6 : n.baseR;
        n.r += (targetR - n.r) * 0.12;

        // glow (wider)
        ctx.globalCompositeOperation = 'lighter';
        const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(60, n.r * 6));
        glowGrad.addColorStop(0, 'rgba(96,165,250,0.18)');
        glowGrad.addColorStop(0.5, 'rgba(124,58,237,0.08)');
        glowGrad.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(60, n.r * 6), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';

        // draw image if available, clipped to circle
        if (n.img && n.img.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          // calculate draw size: use contain for cardapio to avoid cropping, otherwise cover
          const iw = n.img.width;
          const ih = n.img.height;
          let s;
          if (n.id === 'cardapio') {
            s = Math.min((n.r * 2 * 0.9) / iw, (n.r * 2 * 0.9) / ih);
          } else {
            s = Math.max((n.r * 2) / iw, (n.r * 2) / ih);
          }
          const dw = iw * s;
          const dh = ih * s;
          ctx.drawImage(n.img, n.x - dw / 2, n.y - dh / 2, dw, dh);
          ctx.restore();
          // subtle border
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // fallback circle
          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }

        
      }

      // update anchors position/sizes to match nodes (if anchors were created)
      try {
        const rect = canvas.getBoundingClientRect();
        for (let n of nodes) {
          if (n.anchor && n.anchor.style) {
            n.anchor.style.left = `${rect.left + n.x - n.r}px`;
            n.anchor.style.top = `${rect.top + n.y - n.r}px`;
            n.anchor.style.width = `${n.r * 2}px`;
            n.anchor.style.height = `${n.r * 2}px`;
          }
        }
      } catch (e) {
        // ignore DOM update errors
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      mounted = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      if (resizeTimeout) window.clearTimeout(resizeTimeout as any);
      if (ro && ro.disconnect) ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // cleanup any anchor elements we created
      try {
        const s = stateRef.current;
        if (s && s.nodes) {
          for (let n of s.nodes) {
            if (n && n.anchor && n.anchor.remove) n.anchor.remove();
          }
        }
      } catch (e) { /* ignore */ }
    };
  }, [init]);

  // pointer handlers
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      pointer.current.x = px;
      pointer.current.y = py;

      // detect nearest hover node (prefer closest) and set tooltip position
      const nodes = stateRef.current.nodes || [];
      let closest: any = null;
      let closestDist = Infinity;
      for (let n of nodes) {
        const d = Math.hypot(n.x - px, n.y - py);
        const hit = n.r * 1.2 + 8; // slightly larger hit area
        if (d < hit && d < closestDist) {
          closest = n;
          closestDist = d;
        }
      }
      if (closest) {
        setHovered(closest);
        setHoverPos({ x: e.clientX + 12, y: e.clientY + 12 });
      } else {
        setHovered(null);
        setHoverPos(null);
      }
    };
    const onLeave = () => {
      pointer.current.x = -9999;
      pointer.current.y = -9999;
      setHovered(null);
      setHoverPos(null);
    };

    canvas.addEventListener('pointermove', onMove);
    const onPointerDown = (ev: PointerEvent) => {
      pointer.current.down = true;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const nodes = stateRef.current.nodes || [];
      let closest: any = null;
      let closestDist = Infinity;
      for (let n of nodes) {
        const d = Math.hypot(n.x - x, n.y - y);
        const hit = n.r * 1.2 + 8;
        if (d < hit && d < closestDist) {
          closest = n;
          closestDist = d;
        }
      }
      if (closest) {
        console.debug('Ecosystem pointerdown node:', { id: closest.id, name: closest.name, href: closest.href });
        if (closest.href) {
          // prefer anchor click (more reliable across browsers and popup blockers)
          try {
            const a = document.createElement('a');
            a.href = closest.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
            console.debug('anchor click used for', closest.href);
          } catch (e) {
            console.debug('anchor click failed, trying window.open', e);
            try {
              const w = window.open(closest.href, '_blank');
              if (!w) {
                console.debug('window.open blocked, navigating in same tab to', closest.href);
                window.location.href = closest.href;
              } else {
                console.debug('window.open succeeded for', closest.href);
              }
            } catch (e2) {
              console.debug('window.open threw, navigating in same tab', e2);
              window.location.href = closest.href;
            }
          }
        } else {
          setSelected(closest);
        }
      }
    };
    const onPointerUp = () => { pointer.current.down = false; };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onLeave);

    // click to interact with nodes
    const onClick = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const nodes = stateRef.current.nodes || [];
      let closest: any = null;
      let closestDist = Infinity;
      for (let n of nodes) {
        const d = Math.hypot(n.x - x, n.y - y);
        const hit = n.r * 1.2 + 8;
        if (d < hit && d < closestDist) {
          closest = n;
          closestDist = d;
        }
      }
      if (closest) {
        console.debug('Ecosystem clicked node (click):', { id: closest.id, name: closest.name, href: closest.href });
        if (closest.href) {
          try {
            const w = window.open(closest.href, '_blank', 'noopener');
            if (!w) {
              console.debug('window.open blocked (click), navigating in same tab to', closest.href);
              window.location.href = closest.href;
            } else {
              console.debug('window.open succeeded for (click)', closest.href);
            }
          } catch (e) {
            console.debug('window.open threw (click), falling back to anchor click', e);
            const a = document.createElement('a');
            a.href = closest.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.click();
          }
          return;
        }
        setSelected(closest);
      }
    };
    canvas.addEventListener('click', onClick);

    // global pointermove to keep pointer.current updated even when pointer is over overlays/anchors
    const onWindowPointerMove = (ev: PointerEvent) => {
      try {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          pointer.current.x = x;
          pointer.current.y = y;
        } else {
          pointer.current.x = -9999;
          pointer.current.y = -9999;
        }
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('pointermove', onWindowPointerMove);

    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onWindowPointerMove);
    };
  }, [init]);
    return (
    <div className="relative w-full overflow-hidden z-0 py-12" role="region" aria-label="Ecossistema Partículas">
      <div className="absolute left-1/2 -translate-x-1/2 top-[40px] z-50 w-full flex justify-center px-2 sm:px-0">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">Nossos apps mais vendidos</h2>
      </div>
      <div
        className="absolute left-0 right-0 pointer-events-none z-30"
        style={{ top: 0, height: '10%', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '64%',
            height: '220%',
            top: '-60%',
            background:
              'radial-gradient(closest-side at 50% 10%, rgba(239,246,255,0.9) 0%, rgba(248,250,252,0) 60%)',
            filter: 'blur(36px)',
            pointerEvents: 'none',
            opacity: 0.85
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '100%',
            background:
              'linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(248,250,252,0.98) 8%, rgba(248,250,252,0.92) 18%, rgba(248,250,252,0.8) 30%, rgba(248,250,252,0.62) 45%, rgba(248,250,252,0.36) 65%, rgba(248,250,252,0.12) 85%, rgba(248,250,252,0) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      
        {/* top radial glow to match AnimatedBackground */}
        <div className="absolute left-0 right-0" style={{ top: '-8%', height: '24%', pointerEvents: 'none' }}>
          <div style={{ width: '60%', height: '100%', margin: '0 auto', background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, rgba(248,250,252,0) 60%)', filter: 'blur(40px)' }} />
        <div className="absolute left-0 right-0 pointer-events-none z-30" style={{ bottom: 0, height: '16%' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 18%, rgba(255,255,255,0.78) 36%, rgba(255,255,255,0.45) 62%, rgba(255,255,255,0) 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}>
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" style={{ opacity: 0.95 }}>
              <path fill="#93c5fd" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Simple fades only at the section edges (top and bottom) so the fade ends at the section limits */}
      {/* top fade: match AnimatedBackground radial/top palette so it blends with araucárias */}
        {/* Simple top fade: subtle linear gradient contained in the section */}
        {/* concave mask (top): oval shape with site background to cut the top edge */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-40"
          style={{
            width: '220%',
            height: '48vh',
            top: '-24vh',
            borderRadius: '50%',
            background: '#f8fafc'
          }}
        />

        {/* subtle top gradient overlay inside the section to blend into the concave mask */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-30"
          style={{
            top: 0,
            height: '12%',
            background: 'linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(248,250,252,0.95) 18%, rgba(248,250,252,0.78) 36%, rgba(248,250,252,0.45) 62%, rgba(248,250,252,0) 100%)',
            filter: 'blur(4px)'
          }}
        />

      {/* bottom fade: match AnimatedBackground base fog (white -> transparent) so it reads as the same mist */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-30"
        style={{
          height: '12%',
          background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 6%, rgba(255,255,255,0.88) 15%, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.48) 55%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)'
        }}
      />
        {/* Simple bottom fade: subtle linear gradient contained in the section */}
        {/* subtle bottom gradient overlay inside the section to blend into the concave mask */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-30"
          style={{
            bottom: 0,
            height: '14%',
            background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 18%, rgba(255,255,255,0.78) 36%, rgba(255,255,255,0.45) 62%, rgba(255,255,255,0) 100%)',
            filter: 'blur(4px)'
          }}
        />

        {/* concave mask (bottom): oval shape with site background to cut the bottom edge */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-40"
          style={{
            width: '220%',
            height: '48vh',
            bottom: '-24vh',
            borderRadius: '50%',
            background: '#f8fafc'
          }}
        />

      {/* subtle grid background */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.4)_1px,_transparent_0)] bg-[size:40px_40px] pointer-events-none" />
      {/* soft blur orb */}
      <div className="absolute w-[700px] h-[700px] bg-purple-600/8 blur-[140px] rounded-full pointer-events-none" style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }} />

      <div className="relative w-full h-[520px] sm:h-[640px] md:h-[780px] lg:h-[920px] flex items-center justify-center">

        {/* Tooltip shown when hovering a node */}
        {hovered && hoverPos && (
          <div style={{ position: 'fixed', left: hoverPos.x, top: hoverPos.y }} className="z-40 pointer-events-none">
            <div className="bg-slate-800 text-white text-sm px-3 py-1 rounded-md shadow-lg">{hovered.name}</div>
          </div>
        )}

        <div className="relative z-30 w-full h-full">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ display: 'block' }}
          />
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
              <div className="relative bg-slate-900 p-6 rounded-2xl max-w-lg w-full text-white z-60">
                <h3 className="text-2xl font-bold mb-2">{selected.name}</h3>
                <p className="text-sm text-slate-300 mb-4">Status: {selected.status}</p>
                <div className="flex justify-end">
                  <button onClick={() => setSelected(null)} className="px-4 py-2 bg-blue-600 rounded-lg">Fechar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="absolute left-0 right-0 pointer-events-none z-30"
        style={{ bottom: 0, height: '12%', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '100%',
            background:
              'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.98) 8%, rgba(248,250,252,0.92) 18%, rgba(248,250,252,0.8) 30%, rgba(248,250,252,0.62) 45%, rgba(248,250,252,0.36) 65%, rgba(248,250,252,0.12) 85%, rgba(248,250,252,0) 100%)',
            pointerEvents: 'none'
          }}
        />
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            width: '120%',
            height: '220%',
            transform: 'translateX(-10%)',
            opacity: 0.85,
            pointerEvents: 'none'
          }}
        >
          <defs>
            <linearGradient id="g1" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#e6f2ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,40 C150,80 350,0 600,30 C850,60 1050,20 1200,50 L1200,120 L0,120 Z" fill="url(#g1)" />
        </svg>
      </div>

  </div>
  );
};

export default EcossistemaParticulas;
