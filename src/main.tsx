import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
