import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Props = { squareCount: number };

const GlobeAmbientBridge: React.FC<Props> = ({ squareCount }) => {
  const reduced = useReducedMotion();

  const comets = useMemo(() => {
    return Array.from({ length: squareCount }, (_, i) => {
      const r = (s: number) => {
        const x = Math.sin(i * 19.9898 + s * 47.11) * 10000;
        return x - Math.floor(x);
      };
      const down = i % 2 === 0;
      const angle = down ? 25 + r(7) * 20 : -(25 + r(7) * 20);
      const tailLen = 18 + r(8) * 40;
      return {
        id: i,
        leftPct: 1 + r(1) * 97,
        topPct: 5 + r(2) * 90,
        headSize: 2.5 + r(3) * 4,
        tailLen,
        duration: 12 + r(4) * 20,
        delay: r(5) * 14,
        down,
        wobble: (r(6) - 0.5) * 56,
        angle,
      };
    });
  }, [squareCount]);

  if (reduced) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-[min(28vh,220px)] -bottom-[min(32vh,260px)] z-[6] overflow-visible select-none"
      aria-hidden
    >
      {comets.map((c) => (
        <motion.div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.leftPct}%`,
            top: `${c.topPct}%`,
            transform: `rotate(${c.angle}deg)`,
          }}
          initial={false}
          animate={{
            y: c.down
              ? ['-36vh', '-6vh', '32vh', '72vh', '130vh']
              : ['130vh', '72vh', '32vh', '-6vh', '-36vh'],
            x: [0, c.wobble * 0.35, c.wobble * -0.22, c.wobble * 0.15, 0],
            opacity: [0, 0.7, 0.55, 0.25, 0],
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.38, 0.72, 1],
          }}
        >
          {/* Comet: head + tail */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Tail (gradient trail) */}
            <div
              style={{
                width: c.tailLen,
                height: c.headSize * 0.6,
                borderRadius: '999px 0 0 999px',
                background: `linear-gradient(to right, transparent, rgba(180,220,255,0.15), rgba(200,230,255,0.4))`,
                marginRight: -1,
              }}
            />
            {/* Head (bright glowing dot) */}
            <div
              style={{
                width: c.headSize,
                height: c.headSize,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, rgba(160,210,255,0.9) 40%, rgba(100,180,255,0.3) 70%, transparent 100%)',
                boxShadow: `0 0 ${c.headSize * 2}px rgba(140,200,255,0.6), 0 0 ${c.headSize * 4}px rgba(100,170,255,0.25)`,
                flexShrink: 0,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GlobeAmbientBridge;
