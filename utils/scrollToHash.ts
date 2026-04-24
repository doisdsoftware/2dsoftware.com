import type { MouseEvent } from 'react';

/** Altura reservada para a navbar fixa + folga de leitura */
export function getNavScrollOffset(): number {
  if (typeof document === 'undefined') return 88;
  const nav = document.querySelector('nav');
  if (nav) {
    const h = nav.getBoundingClientRect().height;
    return Math.max(72, Math.round(h) + 12);
  }
  return 88;
}

/** Rola até o elemento com o id do hash (ex.: `#sites`). `#` sozinho = topo da página. */
export function scrollToHash(hash: string): boolean {
  if (!hash || hash === '#') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const y = el.getBoundingClientRect().top + window.scrollY - getNavScrollOffset();
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  return true;
}

function canScrollToHash(href: string): boolean {
  if (!href || href === '#') return true;
  const id = href.startsWith('#') ? href.slice(1) : href;
  if (!id) return false;
  return !!document.getElementById(id);
}

/**
 * Útil em onClick de `<a href="#...">`: evita listener global em capture (problemático no mobile)
 * e adia o scroll um frame em ecrãs tácteis para o Safari não ignorar o scroll.
 */
export function handleInternalHashClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
  after?: () => void
): void {
  if (!href.startsWith('#')) return;
  if (!canScrollToHash(href)) return;
  e.preventDefault();
  const run = () => {
    after?.();
    scrollToHash(href);
  };
  const coarse =
    typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches === true;
  if (coarse) requestAnimationFrame(run);
  else run();
}
