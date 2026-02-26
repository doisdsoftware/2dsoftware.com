
import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AraucariaTech: React.FC<{ x: string; y: string; delay: number; scale?: number }> = ({ x, y, delay, scale = 1 }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 0.4, scale: scale }}
    transition={{ duration: 2, delay }}
    style={{ left: x, top: y, position: 'absolute', transform: `scale(${scale})` }}
    className="pointer-events-none"
  >
    <svg width="180" height="240" viewBox="0 0 150 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="72" y="100" width="6" height="150" fill="url(#trunkGradient)" rx="3" />
      <g className="animate-pulse" style={{ animationDuration: '5s' }}>
        <path d="M75 60 C30 80 10 50 5 40" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        <path d="M75 65 C120 85 140 55 145 45" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        <path d="M75 80 C40 100 25 80 20 70" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
        <path d="M75 85 C110 105 125 85 130 75" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
        
        <circle cx="5" cy="40" r="5" fill="#10b981" />
        <circle cx="145" cy="45" r="5" fill="#10b981" />
        <circle cx="20" cy="70" r="4" fill="#3b82f6" />
        <circle cx="130" cy="75" r="4" fill="#3b82f6" />
      </g>
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

const CableCar: React.FC = () => (
  <motion.div
    initial={{ x: "-10%", y: "35%" }}
    animate={{ x: "110%", y: "25%" }}
    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
    className="absolute z-0 pointer-events-none opacity-40"
  >
    <div className="relative">
      <div className="absolute top-0 w-[200vw] h-[1px] bg-blue-400/20 -left-[100vw]" />
      <div className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center border border-blue-200">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      </div>
      <div className="w-[2px] h-6 bg-blue-300/40 mx-auto" />
    </div>
  </motion.div>
);

const DigitalSnow: React.FC<{ id: number }> = ({ id }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDuration = useMemo(() => 20 + Math.random() * 30, []);
  const randomDelay = useMemo(() => Math.random() * 20, []);
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0, x: `${randomX}%` }}
      animate={{ 
        y: '110vh', 
        opacity: [0, 0.5, 0.5, 0],
      }}
      transition={{ 
        duration: randomDuration, 
        repeat: Infinity, 
        delay: randomDelay,
        ease: "linear" 
      }}
      className="absolute w-2 h-2 bg-blue-400/20 rounded-sm pointer-events-none rotate-45"
    />
  );
};

const AnimatedBackground: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 3000], [0, -400]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -200]);

  return (
    <div className="fixed inset-0 -z-10 bg-[#f8fafc] overflow-hidden pointer-events-none">
      {/* Gradientes Suaves de Alvorada */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#f8fafc_100%)]" />
      <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-blue-100/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-100/30 blur-[150px] rounded-full" />
      
      {/* Grid Sutil */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      
      {/* Fluxos de Vento Digital */}
      <div className="data-stream" style={{ top: '15%', animationDuration: '7s' }} />
      <div className="data-stream" style={{ top: '50%', animationDuration: '10s', animationDelay: '2s' }} />
      
      <CableCar />

      {[...Array(25)].map((_, i) => (
        <DigitalSnow key={i} id={i} />
      ))}

      {/* Montanhas Claras */}
      <motion.div style={{ y: y1 }} className="absolute bottom-0 left-0 w-full h-[55vh] opacity-30">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="#93c5fd" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L0,320Z" />
        </svg>
      </motion.div>
      
      <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 w-full h-[40vh] opacity-20">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="#bfdbfe" d="M0,128L80,144C160,160,320,192,480,181.3C640,171,800,117,960,112C1120,107,1280,149,1360,170.7L1440,192L1440,320L0,320Z" />
        </svg>
      </motion.div>

      {/* Araucárias Tech mais vibrantes */}
      <AraucariaTech x="5%" y="10%" delay={0.5} scale={1.1} />
      <AraucariaTech x="85%" y="8%" delay={1.2} scale={1.3} />
      <AraucariaTech x="75%" y="70%" delay={2.1} scale={0.8} />
      <AraucariaTech x="15%" y="65%" delay={1.5} scale={1.2} />

      {/* Névoa na Base */}
      <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-white to-transparent opacity-90" />
    </div>
  );
};

export default AnimatedBackground;
