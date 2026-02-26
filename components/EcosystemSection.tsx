
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';

const logoPngUrl = new URL('../logo/ChatGPT Image 14 de fev. de 2026, 19_14_24.png', import.meta.url).href;
const logoSvgUrl = new URL('../logo/logo.svg', import.meta.url).href;

const DELIVERY_IMAGES = [
  new URL('../prints/001_home.png', import.meta.url).href,
  new URL('../prints/002_products.png', import.meta.url).href,
  new URL('../prints/003_admin_overview.png', import.meta.url).href,
  new URL('../prints/006_admin_orders.png', import.meta.url).href,
  new URL('../prints/007_admin_reports.png', import.meta.url).href,
];

interface AppNode {
  id: string;
  name: string;
  status: 'Ativo' | 'Em desenvolvimento' | 'Futuro';
  description: string;
  images?: string[];
}

const APPS: AppNode[] = [
  {
    id: 'delivery',
    name: 'App Delivery',
    status: 'Ativo',
    description: 'Sistema completo de gestão de pedidos, logística de entregas e integração com gateways de pagamento em tempo real.',
    images: DELIVERY_IMAGES
  },
  {
    id: 'explorer',
    name: 'City Explorer',
    status: 'Ativo',
    description: 'Guia turístico interativo de Campos do Jordão com geolocalização precisa, trilhas e pontos de interesse em realidade aumentada.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=500']
  },
  {
    id: 'fidelidade',
    name: 'App Fidelidade',
    status: 'Em desenvolvimento',
    description: 'Plataforma de gamificação com sistema de pontos e recompensas para retenção de clientes no varejo local.',
  },
  {
    id: 'cardapio',
    name: 'App Cardápio',
    status: 'Em desenvolvimento',
    description: 'Interface digital interativa para restaurantes, permitindo pedidos via QR Code e gestão automatizada de cozinha.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    status: 'Futuro',
    description: 'Painel administrativo inteligente com BI (Business Intelligence) para controle total do ecossistema de software.',
  },
  {
    id: 'white-label',
    name: 'White Label',
    status: 'Futuro',
    description: 'Nossa tecnologia pronta para ser vestida com a sua marca, oferecendo escalabilidade e robustez imediata.',
  }
];

const EcosystemSection: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<AppNode | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [deliveryIdx, setDeliveryIdx] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (selectedApp?.id === 'delivery' && selectedApp.images) {
      const interval = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % selectedApp.images!.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    setCurrentImageIdx(0);
  }, [selectedApp]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryIdx((p) => (p + 1) % DELIVERY_IMAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // accessibility: close modal with Escape and focus management
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedApp(null);
    };
    if (selectedApp) {
      document.addEventListener('keydown', onKey);
      // focus close button shortly after open
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedApp]);

  const openApp = useCallback((app: AppNode) => setSelectedApp(app), []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<{ left: number; top: number }[]>([]);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bubbleSize, setBubbleSize] = useState<number>(88);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const bubble = Math.min(220, Math.max(96, w * 0.12));
      const padding = 100;
      // much larger radius to spread items further apart
      const baseRadius = Math.max(340, Math.min(w, h) * 0.6 - bubble - padding);
      const angleOffset = 0.3; // increased angular spacing per item

      const newPos = APPS.map((_, i) => {
        const angle = (i / APPS.length) * Math.PI * 2 - Math.PI / 2 + i * angleOffset;
        let x = cx + Math.cos(angle) * baseRadius - bubble / 2;
        let y = cy + Math.sin(angle) * baseRadius * 0.85 - bubble / 2;
        // clamp inside container with larger margins
        x = Math.max(20, Math.min(w - bubble - 20, x));
        y = Math.max(20, Math.min(h - bubble - 20, y));
        return { left: x, top: y };
      });

      // small delay to ensure layout settled
      setBubbleSize(bubble);
      setCenter({ x: cx, y: cy });
      setPositions(newPos);
      console.debug('Ecosystem positions updated', { w, h, bubble, baseRadius, positionsCount: newPos.length });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-500';
      case 'Em desenvolvimento': return 'bg-amber-500';
      case 'Futuro': return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'Ativo': return 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'Em desenvolvimento': return 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'Futuro': return 'shadow-[0_0_15px_rgba(99,102,241,0.5)]';
      default: return '';
    }
  };
  
  // increase side bubble visual size but keep nucleus unchanged
  const sideSize = Math.round(bubbleSize * 1.45);
  // make labels closer to the bubbles
  const labelOffset = -Math.round(sideSize * 0.35);

  const getStatusHex = (status: string) => {
    switch (status) {
      case 'Ativo': return '#10B981';
      case 'Em desenvolvimento': return '#F59E0B';
      case 'Futuro': return '#6366F1';
      default: return '#94A3B8';
    }
  };

  return (
    <section id="ecossistema" className="relative min-h-screen bg-slate-950 py-24 flex items-center justify-center overflow-hidden">
      {/* 4. Fundo Tecnológico e Glow Animado */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.4)_1px,_transparent_0)] bg-[size:40px_40px] pointer-events-none" />
      
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[700px] h-[700px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none"
      />

      <div ref={containerRef} className="relative w-full max-w-4xl h-[700px] flex items-center justify-center">
        
        {/* 1. Anéis de Órbita */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-purple-500/10 animate-pulse" />
          <div className="absolute w-[450px] h-[450px] rounded-full border border-blue-500/10" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-emerald-500/10" />
        </div>

        {/* 7. Bolha Central (Reator Tecnológico) */}
        <motion.div
          animate={hoveredIndex !== null ? { scale: 1.06, boxShadow: '0 0 100px rgba(124,58,237,0.45)' } : { scale: 1, boxShadow: '0 0 40px rgba(147,51,234,0.4)' }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.35 }}
          className="relative z-30 w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white border border-white/6 shadow-xl"
        >
          <span className="sr-only">Núcleo 2D Software</span>
          <img
            src={logoPngUrl}
            alt="2D Software"
            className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl rounded-full bg-white/5 p-2"
            loading="eager"
            decoding="async"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoSvgUrl; }}
          />
        </motion.div>

        {/* SVG linhas conectando núcleo → bolhas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          {positions.length === APPS.length && positions.map((p, i) => {
            const x1 = center.x;
            const y1 = center.y;
            const x2 = p.left + bubbleSize / 2;
            const y2 = p.top + bubbleSize / 2;
            const stroke = getStatusHex(APPS[i].status);
            const isActive = hoveredIndex === i;
            return (
              <motion.line
                key={`line-${APPS[i].id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={isActive ? 3.5 : 1.8}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: isActive ? 0 : 100, opacity: isActive ? 1 : 0.45 }}
                transition={{ duration: 0.45 }}
              />
            );
          })}
        </svg>

        {/* Órbitas e Bolhas (posicionamento calculado para evitar sobreposição) */}
        {APPS.map((app, index) => {
          const hasPos = positions.length === APPS.length;
          const pos = hasPos ? positions[index] : null;
          if (!hasPos && index === 0) console.debug('positions not ready yet, rendering fallback layout');
          return (
            <button
              key={app.id}
              onClick={() => openApp(app)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              aria-label={`${app.name} — ${app.status}`}
              className="absolute pointer-events-auto"
              style={
                pos
                  ? { left: pos.left, top: pos.top }
                  : { left: '50%', top: '50%', transform: `translate(${Math.cos((index / APPS.length) * Math.PI * 2) * 220}px, ${Math.sin((index / APPS.length) * Math.PI * 2) * 180}px)` }
              }
            >
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: labelOffset, pointerEvents: 'none' }}>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black text-white ${getStatusColor(app.status)} ${getStatusGlow(app.status)} mb-1`}>{app.status}</div>
                <div className="text-[10px] font-extrabold text-white leading-tight">{app.name}</div>
              </div>

              <div className={`relative rounded-full overflow-hidden bg-gradient-to-b from-white/3 to-black/10 border border-white/6 shadow-lg flex items-center justify-center transition-transform duration-200 ${hoveredIndex === index ? 'scale-105 z-40' : ''}`} style={{ width: sideSize, height: sideSize }}>
                {app.id === 'delivery' ? (
                  <img src={DELIVERY_IMAGES[deliveryIdx]} alt={`${app.name} preview`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal Premium */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 w-full max-w-3xl rounded-[40px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                {/* 6. Carrossel mais Cinematográfico */}
                <div className="bg-slate-950 h-64 md:h-full relative flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {selectedApp.images ? (
                      <motion.img 
                        key={`${selectedApp.id}-${currentImageIdx}`}
                        src={selectedApp.images[currentImageIdx]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-600">
                        <Play className="w-12 h-12 mb-4 opacity-20" />
                        <span className="text-xs uppercase font-bold tracking-widest">Preview em breve</span>
                      </div>
                    )}
                  </AnimatePresence>
                  {/* Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
                </div>

                {/* Lado do Conteúdo */}
                <div className="p-10 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black text-white ${getStatusColor(selectedApp.status)} ${getStatusGlow(selectedApp.status)} mb-3`}>
                        {selectedApp.status}
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tight">{selectedApp.name}</h3>
                    </div>
                    <button 
                      ref={closeBtnRef}
                      type="button"
                      onClick={() => setSelectedApp(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                    {selectedApp.description}
                  </p>

                  <div className="mt-auto">
                    <button className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={selectedApp.status !== 'Ativo'}>
                      <span>Abrir aplicação</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {selectedApp.status !== 'Ativo' && (
                      <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-black tracking-widest opacity-40">Indisponível no momento</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section title removed per request (labels shown above bubbles) */}
    </section>
  );
};

export default EcosystemSection;
