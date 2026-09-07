import path from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Em dev, /privacidade e /termos abrem as páginas estáticas (sem cair no SPA). */
function legalPagesDev(): Plugin {
  const map: Record<string, string> = {
    '/privacidade': '/privacidade/index.html',
    '/privacidade/': '/privacidade/index.html',
    '/privacidade.html': '/privacidade/index.html',
    '/termos': '/termos/index.html',
    '/termos/': '/termos/index.html',
    '/termos.html': '/termos/index.html',
    '/exclusao-dados': '/exclusao-dados/index.html',
    '/exclusao-dados/': '/exclusao-dados/index.html',
    '/exclusao-dados.html': '/exclusao-dados/index.html',
  };
  return {
    name: 'legal-pages-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = (req.url || '').split('?')[0];
        const target = map[url];
        if (target) {
          req.url = target;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), legalPagesDev()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
