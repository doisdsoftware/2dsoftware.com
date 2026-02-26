
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

const App: React.FC = () => {
  // Smooth scroll implementation
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href) return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

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

  return (
    <div className="min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
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
  );
};

export default App;
