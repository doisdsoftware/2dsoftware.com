import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Props = { squareCount: number };

/**
 * Camada decorativa no estilo do fundo global (quadrados “DigitalSnow” + faixas “data-stream”),
 * com trajetórias longas em vh para atravessar o globo e as seções vizinhas, suavizando o corte visual.
 */
const GlobeAmbientBridge: React.FC<Props> = ({ squareCount }) => {
  const reduced = useReducedMotion();

  const squares = useMemo(() => {
    return Array.from({ length: squareCount }, (_, i) => {
      const r = (s: number) => {
        const x = Math.sin(i * 19.9898 + s * 47.11) * 10000;
        return x - Math.floor(x);
      };
      const down = i % 2 === 0;
      return {
        id: i,
        leftPct: 1 + r(1) * 97,
        topPct: 5 + r(2) * 90,
        size: 2.5 + r(3) * 7,
        duration: 19 + r(4) * 28,
        delay: r(5) * 16,
        down,
        wobble: (r(6) - 0.5) * 56,
      };
    });
  }, [squareCount]);

  const streams = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const r = (s: number) => {
        const x = Math.sin(i * 31.1 + s * 17.7) * 10000;
        return x - Math.floor(x);
      };
      return {
        id: i,
        topPct: 8 + r(1) * 84,
        duration: 6 + r(2) * 7,
        delay: r(3) * 5,
      };
    });
  }, []);

  if (reduced) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-[min(28vh,220px)] -bottom-[min(32vh,260px)] z-[6] overflow-visible select-none"
      aria-hidden
    >
      {streams.map((s) => (
        <div
          key={`stream-${s.id}`}
          className="data-stream opacity-[0.18]"
          style={{
            top: `${s.topPct}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {squares.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rotate-45 rounded-sm border border-blue-400/30 bg-blue-400/18 shadow-[0_0_14px_rgba(96,165,250,0.18)]"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.leftPct}%`,
            top: `${s.topPct}%`,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
          }}
          initial={false}
          animate={{
            y: s.down
              ? ['-36vh', '-6vh', '32vh', '72vh', '130vh']
              : ['130vh', '72vh', '32vh', '-6vh', '-36vh'],
            x: [0, s.wobble * 0.35, s.wobble * -0.22, s.wobble * 0.15, 0],
            opacity: [0, 0.5, 0.42, 0.2, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.38, 0.72, 1],
          }}
        />
      ))}
    </div>
  );
};

export default GlobeAmbientBridge;
