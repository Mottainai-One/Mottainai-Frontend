import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Routes from '@/routes'
import { AuthProvider } from '@/context/AuthProvider' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> 
      {/* Abre direto no Routes */}
      <Routes />
    </AuthProvider>
  </StrictMode>,
)