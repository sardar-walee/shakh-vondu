import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle unhandled Firebase Auth popup iframe restrictions
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (
    msg.includes('INTERNAL ASSERTION FAILED') ||
    msg.includes('popup-blocked') ||
    msg.includes('cancelled-popup-request') ||
    msg.includes('Pending promise was never set')
  ) {
    event.preventDefault();
    console.warn("Caught and handled Firebase Auth popup restriction:", msg);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
