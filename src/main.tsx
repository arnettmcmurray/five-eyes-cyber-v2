import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Dev visibility — log API config on startup so auth/env issues are obvious at a glance.
if (import.meta.env.DEV) {
  const apiBase = import.meta.env['VITE_API_BASE'] ?? 'http://localhost:3001 (fallback)';
  const apiKey  = import.meta.env['VITE_API_KEY']  ? 'set via VITE_API_KEY' : 'dev-local-key (fallback)';
  console.info('[Five Eyes] Frontend config — API base:', apiBase, '| API key:', apiKey);
  console.info('[Five Eyes] Admin login:   /admin/login  (password-only, admin_token in localStorage)');
  console.info('[Five Eyes] Learner login: /login        (OTP-only, learner_token in localStorage)');
  console.info('[Five Eyes] Health check:  http://localhost:3001/health');
}

// Apply persisted theme before first render to avoid flash
const storedTheme = localStorage.getItem('five-eyes-theme');
if (storedTheme === 'light') {
  document.documentElement.dataset.theme = 'light';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
