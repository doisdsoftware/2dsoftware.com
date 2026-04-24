
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { handleInternalHashClick } from '../utils/scrollToHash';

const logoPngUrl = new URL('../logo/ChatGPT Image 14 de fev. de 2026, 19_14_24.png', import.meta.url).href;
const logoSvgUrl = new URL('../logo/logo.svg', import.meta.url).href;

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>(logoPngUrl);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // preload logo and fallback to svg if png fails
  useEffect(() => {
    let mounted = true;
    const img = new Image();
    img.src = logoPngUrl;
    img.onload = () => { if (mounted) setLogoSrc(logoPngUrl); };
    img.onerror = () => { if (mounted) setLogoSrc(logoSvgUrl); };
    return () => { mounted = false; };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        mobileMenuOpen
          ? 'z-[110] overflow-visible'
          : 'z-[70] overflow-visible'
      } ${
        isScrolled
          ? 'h-12 border-b border-white/40 bg-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60'
          : 'h-20 bg-transparent'
      }`}
    >
      {/* Camada abaixo do cabeçalho e do painel: fecha o menu e garante toques acima do conteúdo (z-50–60) no mobile */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-0 cursor-default bg-slate-900/50"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="relative z-[60] container mx-auto min-w-0 px-4 sm:px-6 flex justify-between items-center h-full gap-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className={`rounded-lg overflow-hidden bg-transparent flex items-center justify-center transition-all duration-300 ${isScrolled ? 'w-12 h-12 sm:w-12 sm:h-12' : 'w-20 h-20 sm:w-16 sm:h-16'}`}>
            <img
              src={logoSrc}
              alt="2D Software"
              className="w-full h-full object-contain transform transition-transform duration-200 hover:scale-110"
              loading="eager"
              decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoSvgUrl; }}
            />
          </div>
          <span className="hidden sm:inline-block text-xl font-bold tracking-tighter text-slate-900">Software</span>
        </motion.div>
        <div className="hidden sm:flex min-w-0 items-center gap-3 md:gap-5 lg:gap-7">
          {NAV_ITEMS.map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={
                item.href.startsWith('#')
                  ? (e) => handleInternalHashClick(e, item.href)
                  : undefined
              }
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="whitespace-nowrap text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
          <motion.a
            href="https://wa.me/5512997775889"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            WhatsApp
          </motion.a>
        </div>

        <button
          type="button"
          className="md:hidden touch-manipulation text-slate-900 p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="navigation"
            aria-label="Menu principal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 z-[60] border-t border-slate-700/90 bg-slate-900/97 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3 p-5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) =>
                    handleInternalHashClick(e, item.href, () => setMobileMenuOpen(false))
                  }
                  className="block w-full touch-manipulation rounded-xl border border-slate-600/90 bg-slate-800 px-4 py-3.5 text-center text-base font-semibold text-white shadow-inner transition hover:bg-slate-700 active:bg-slate-800"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://wa.me/5512997775889"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full touch-manipulation rounded-xl bg-blue-600 py-3.5 text-center text-base font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
              >
                Falar no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
