
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageSquare } from 'lucide-react';

const TerminalAnimation: React.FC = () => {
  const lines = [
    "npm run dev",
    "vite v6.4.1 ready in 300ms",
    "import App from './App';",
    "fetch('/api/sites').then(res => res.json()).then(console.log)",
    "GET /api/products 200 OK",
    "db.connect()",
    "serviceWorker.register()",
    "analytics.track('page_view', { path: '/' })",
    "git add . && git commit -m \"feat: deploy\"",
    "build: success",
    "deploy: success",
  ];

  const maxVisible = 4;
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let timeout: number;
    const current = lines[currentIndex];

    if (charIndex < current.length) {
      timeout = window.setTimeout(() => {
        const next = charIndex + 1;
        setCharIndex(next);
        setDisplay(current.slice(0, next));
      }, 40);
    } else {
      timeout = window.setTimeout(() => {
        setHistory((h) => {
          const next = [...h, current];
          if (next.length > maxVisible) next.shift();
          return next;
        });
        setCurrentIndex((i) => (i + 1) % lines.length);
        setCharIndex(0);
        setDisplay('');
      }, 700 + Math.random() * 400);
    }

    return () => window.clearTimeout(timeout);
  }, [charIndex, currentIndex]);

  return (
    <>
      {history.map((l, i) => (
        <div key={i} className="text-green-300">{l}</div>
      ))}
      <div className="text-green-300">
        {display}
        <span className="ml-1 animate-pulse">|</span>
      </div>
    </>
  );
};


const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto grid gap-8 sm:gap-16 items-center relative z-10 lg:grid-cols-[0.5fr_0.5fr]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-5 py-2 mb-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-widest uppercase shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Software de Alta Performance</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 md:mb-8 text-slate-900">
            <span>Software </span>
            <span className="text-gradient">de alto impacto</span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-8 md:mb-12 max-w-2xl leading-relaxed font-medium">
            Transformamos ideias em software robusto: interfaces claras, código escalável e soluções que resolvem problemas reais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <motion.a
              href="https://wa.me/5512997775889"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-3 px-6 py-3 sm:px-10 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/30"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-lg">Falar no WhatsApp</span>
            </motion.a>
            <motion.a
              href="#produtos"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-10 sm:py-5 glass hover:bg-white rounded-2xl font-bold transition-all border border-blue-100 text-slate-700"
            >
              <span className="text-lg">Nossas Soluções</span>
              <ChevronRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex flex-col items-center justify-center w-full lg:justify-end lg:pl-6 mt-6 lg:mt-0"
          >
            {/* Mobile-only headline above the terminal card, follows site title styles */}
            <h3 className="md:hidden text-xl font-bold text-slate-900 text-center mb-4">Evoluindo e modernizando sempre</h3>
            <div className="relative z-10 p-2 sm:p-3 glass rounded-2xl sm:rounded-[48px] shadow-2xl overflow-visible group border-transparent w-full max-w-xs sm:max-w-lg mx-auto mt-2 sm:mt-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/8 via-transparent to-purple-500/8 opacity-50 transition-opacity duration-700 rounded-2xl sm:rounded-[48px]" />
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }} className="rounded-xl sm:rounded-[20px] w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-stretch p-2 sm:p-4">
                <div className="w-full flex items-center justify-center">
                  <div className="w-full rounded-lg sm:rounded-[14px] bg-[#071032] border border-transparent p-2 sm:p-4 flex flex-col min-h-[180px] sm:min-h-[420px] md:min-h-[460px]">
                    <div className="flex items-center gap-2 mb-2 sm:mb-4">
                      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                      <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
                      <div className="ml-2 sm:ml-3 text-xs text-slate-400">Terminal — 2d-software</div>
                    </div>
                    <div className="flex-1 overflow-auto pr-1 sm:pr-2">
                      <pre className="font-mono text-xs sm:text-base md:text-lg text-green-300 leading-6 sm:leading-7 whitespace-pre-wrap">
                        <TerminalAnimation />
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 w-24 sm:w-48 h-24 sm:h-48 bg-blue-200/50 blur-[40px] sm:blur-[80px] rounded-full animate-pulse" />
          </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden transform rotate-180 opacity-40 pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[150px] fill-current text-blue-100">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
