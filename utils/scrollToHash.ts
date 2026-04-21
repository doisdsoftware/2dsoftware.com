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
