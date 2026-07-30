import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './app/Router'
import { AuthProvider } from './features/auth/AuthContext'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </StrictMode>,
)
