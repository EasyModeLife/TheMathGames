import { writable } from 'svelte/store';

// Store con la ruta actual (pathname) sin query ni hash
const initial = (() => {
  // Usa pathname actual; como fallback, revisa sessionStorage (caso 404.html de hosts estáticos)
  try {
    const saved = sessionStorage.getItem('initial-path');
    if (saved) return normalizePath(saved);
  } catch {}
  return normalizePath(location.pathname);
})();
export const path = writable<string>(initial);

// Normaliza: asegura que empieza con '/'; colapsa //; quita trailing slash excepto en '/'
function normalizePath(p: string) {
  try {
    let n = decodeURI(p || '/');
    if (!n.startsWith('/')) n = '/' + n;
    n = n.replace(/\/+/, '/');
    if (n.length > 1 && n.endsWith('/')) n = n.slice(0, -1);
    return n;
  } catch {
    return '/';
  }
}

// Navega a una ruta
export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const target = normalizePath(to);
  if (opts.replace) history.replaceState({}, '', target);
  else history.pushState({}, '', target);
  path.set(target);
}

// Soporte de navegación con atrás/adelante
window.addEventListener('popstate', () => {
  path.set(normalizePath(location.pathname));
});

// Intercepta clicks en enlaces internos <a href="/algo">
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  // Busca el <a> más cercano
  const anchor = target.closest('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  const rel = (anchor.getAttribute('rel') || '').toLowerCase();
  const targetAttr = (anchor.getAttribute('target') || '').toLowerCase();
  // Evita externos/nuevas pestañas/mailto/tel/#/http
  const external = /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
  if (external || targetAttr === '_blank' || rel.includes('external')) return;
  if (href.startsWith('/')) {
    e.preventDefault();
    navigate(href);
  }
});
