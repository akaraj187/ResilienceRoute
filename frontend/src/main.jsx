import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupApiInterceptor } from './services/mockApi'

// Initialize standalone API interceptor for GitHub Pages & resilient fallback
setupApiInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
