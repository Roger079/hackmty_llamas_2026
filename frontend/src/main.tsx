import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="Error de Carga en la Plataforma Banorte">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA Service Worker for offline support and installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[PWA] Service Worker registrado exitosamente con scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Falló el registro del Service Worker:', err);
      });
  });
}
