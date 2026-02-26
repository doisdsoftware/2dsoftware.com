
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/styles/cards-3d.css';

// Suppress or handle some noisy runtime warnings/errors that
// originate from browser extensions or third-party libs.
// These handlers avoid uncaught promise rejections and filter
// known non-actionable console warnings (THREE.Clock, SES, MetaMask).
const _consoleWarn = console.warn.bind(console);
console.warn = (...args: any[]) => {
  try {
    const joined = args.map(a => String(a)).join(' ');
    if (/THREE\.Clock|Removing unpermitted intrinsics|SES|MetaMask/i.test(joined)) return;
  } catch (e) {
    // fallthrough to default warn
  }
  _consoleWarn(...args);
};

window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
  const reason: any = (ev && (ev as any).reason) || null;
  if (reason && reason.message && /Failed to connect to MetaMask|MetaMask extension not found/i.test(reason.message)) {
    ev.preventDefault();
    console.info('MetaMask not available (suppressed)');
  }
});

window.addEventListener('error', (ev: ErrorEvent) => {
  if (ev && ev.message && /lockdown-install|Removing unpermitted intrinsics|SES/i.test(ev.message)) {
    try { ev.preventDefault(); } catch { /* ignore */ }
    console.info('Suppressed extension/SES message');
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
