import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context';
import './index.css'
import App from './App.tsx'
import { authConfig } from './auth/authConfig.ts';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider {...authConfig}>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
