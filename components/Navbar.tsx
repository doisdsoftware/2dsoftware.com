
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

const logoPngUrl = new URL('../logo/ChatGPT Image 14 de fev. de 2026, 19_14_24.png', import.meta.url).href;
const logoSvgUrl = new URL('../logo/logo.svg', import.meta.url).href;

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-4 glass' : 'py-6 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-transparent flex items-center justify-center">
            <img
              src={logoPngUrl}
              alt="2D Software"
              className="w-full h-full object-contain"
              loading="eager"
              decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = logoSvgUrl; }}
            />
          </div>
          <span className="text-xl font-bold tracking-tighter text-slate-900">Software</span>
        </motion.div>

        <div className="hidden sm:flex items-center space-x-4 md:space-x-8">
          {NAV_ITEMS.map((item, idx) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                try {
                  if (item.href && item.href.startsWith('#')) {
                    e.preventDefault();
                    const el = document.querySelector(item.href);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                } catch (err) {}
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
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
          className="md:hidden text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass absolute top-full left-0 right-0 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    try {
                      if (item.href && item.href.startsWith('#')) {
                        e.preventDefault();
                        const el = document.querySelector(item.href);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    } catch (err) {}
                    setMobileMenuOpen(false);
                  }}
                  className="text-base sm:text-lg font-semibold text-slate-700"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="https://wa.me/5512997775889"
                className="w-full py-3 bg-blue-600 text-white text-center rounded-lg font-bold"
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
