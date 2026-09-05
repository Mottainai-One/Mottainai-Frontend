/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem('token'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial lido do token de forma síncrona (evita setState dentro de effect)
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn);
  // isLoading se torna o segundo elemento do estado quando houver refresh de token
  const [isLoading] = useState(false);

  async function login(email: string, password: string) {
    const token = await fakeApiLogin(email, password);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }

  const value: AuthContextType = { isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Método fake enquanto não tem back
async function fakeApiLogin(email: string, password: string) {
  if (!email || !password) {
    throw new Error('Credenciais inválidas');
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  return 'fake-token-123';
}