import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import * as authService from '@/services/authService';
import type {
  AuthContextData,
  DecodedToken,
  LoginCredentials,
  User,
} from '@/types/auth.types';

const TOKEN_KEY = '@App:token';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthState {
  token: string | null;
  user: User | null;
}


// Função para pegar o tokej
function decodeUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 < Date.now()) return null;

    return {
      id: decoded.sub,
      name: decoded.name ?? '',
      email: decoded.email ?? '',
    };
  } catch {
    return null;
  }
}

// Função para inicializar o token se nao tiver
function getInitialAuthState(): AuthState {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (!storedToken) return { token: null, user: null };

  const decodedUser = decodeUserFromToken(storedToken);
  if (!decodedUser) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }

  return { token: storedToken, user: decodedUser };
}

// Cabo para repasssar para toda a aplicação 
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função de Login com token
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const { token } = await authService.login(credentials);
      const decodedUser = decodeUserFromToken(token);

      if (!decodedUser) {
        throw new Error('Não foi possível validar o token recebido.');
      }

      localStorage.setItem(TOKEN_KEY, token);
      setAuthState({ token, user: decodedUser });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar.';
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // Função do Logout tirando do localStorage
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthState({ token: null, user: null });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = useMemo(
    () => !!authState.token && !!authState.user,
    [authState]
  );

  const value = useMemo<AuthContextData>(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated,
      isLoggingIn,
      error,
      login,
      logout,
      clearError,
    }),
    [authState, isAuthenticated, isLoggingIn, error, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}