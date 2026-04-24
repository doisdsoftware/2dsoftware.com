
import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Features from './components/Features';
import TechSection from './components/TechSection';
import GlobeApps from './components/GlobeApps';
import SitesSection from './components/SitesSection';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import ConsentGate from './components/ConsentGate';

const App: React.FC = () => {
  // Âncoras internas: links nativos href="#..." + scroll-margin-top em index.css (sem interceptar no document).

  // Mobile back-button behavior: first back -> scroll to top, second back -> exit
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isTouch) return;

    // push an extra history entry so the back button triggers popstate
    try {
      history.pushState({preventBack: true}, '');
    } catch {}

    const onPop = (ev: PopStateEvent) => {
      // if user is not at top, scroll to top and re-push a state so another back is required
      try {
        if (window.scrollY > 20) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // re-push to prevent immediate exit
          try { history.pushState({preventBack: true}, ''); } catch {}
        } else {
          // allow default back behavior (exit or navigate back)
          // remove this handler briefly so back works naturally
          // (we don't remove history state here to keep behavior consistent on next visit)
        }
      } catch (e) {
        // fallback: do nothing
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* Navbar e gates fixos ficam FORA do wrapper com overflow-x-hidden: em vários
     navegadores mobile, fixed + overflow no ancestral quebra hit-testing/toques. */
  return (
    <>
      <AnimatedBackground />
      <ConsentGate />
      <Navbar />
      <div className="min-h-screen overflow-x-hidden">
        <main>
          <Hero />
          <About />
          <GlobeApps />
          <Products />
          <SitesSection />
          <Features />
          <TechSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default App;
