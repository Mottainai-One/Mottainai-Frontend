import { useReducer, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import * as authService from '@/services/authService';
import type {
  AuthContextData,
  DecodedToken,
  LoginCredentials,
  AuthProviderProps,
  AuthAction,
  AuthState,
  StoredAuthToken,
  User,
} from '@/types/auth.types';
import { sanitizeLoginCredentials, validateLoginCredentials } from '@/utils/loginValidation';

const TOKEN_KEY = '@App:token';

// Decodifica o token e obtém os dados básicos da sessão.
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

// Recupera a sessão local apenas quando o mock está habilitado.
const initialAuthState: AuthState = {
  token: null,
  user: null,
  isLoggingIn: false,
  error: null,
};

function isStoredAuthToken(value: unknown): value is StoredAuthToken {
  return typeof value === 'object'
    && value !== null
    && '_versao' in value
    && value._versao === 1
    && 'token' in value
    && typeof value.token === 'string';
}

function discardStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // O estado inicial sem autenticação continua seguro se o armazenamento estiver bloqueado.
  }
}

function getInitialAuthState(): AuthState {
  if (!authService.isMockAuthenticationEnabled) {
    discardStoredToken();
    return initialAuthState;
  }

  let storedValue: string | null;
  try {
    storedValue = localStorage.getItem(TOKEN_KEY);
  } catch {
    return initialAuthState;
  }
  if (!storedValue) return initialAuthState;

  let token: string | null = null;
  let isCurrentSchema = false;
  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    if (isStoredAuthToken(parsedValue)) {
      token = parsedValue.token;
      isCurrentSchema = true;
    } else if (typeof parsedValue === 'string') {
      token = parsedValue;
    }
  } catch {
    token = storedValue;
  }

  if (!token) {
    discardStoredToken();
    return initialAuthState;
  }

  const decodedUser = decodeUserFromToken(token);
  if (!decodedUser) {
    discardStoredToken();
    return initialAuthState;
  }

  if (!isCurrentSchema) {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ _versao: 1, token } satisfies StoredAuthToken));
    } catch {
      // A sessão continua válida durante esta visita mesmo se a migração falhar.
    }
  }

  return { ...initialAuthState, token, user: decodedUser };
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'login-started':
      return { ...state, isLoggingIn: true, error: null };
    case 'login-succeeded':
      return { token: action.token, user: action.user, isLoggingIn: false, error: null };
    case 'login-failed':
      return { ...state, isLoggingIn: false, error: action.error };
    case 'logged-out':
      return initialAuthState;
    case 'error-cleared':
      return { ...state, error: null };
  }
}

// Compartilha o estado de autenticação com a aplicação.
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, dispatch] = useReducer(authReducer, undefined, getInitialAuthState);

  // Valida e inicia a sessão de demonstração.
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'login-started' });

    try {
      const errors = validateLoginCredentials(credentials);
      if (Object.keys(errors).length > 0) {
        throw new Error(Object.values(errors)[0] ?? 'Revise os dados de acesso.');
      }
      const { token } = await authService.login(sanitizeLoginCredentials(credentials));
      const decodedUser = decodeUserFromToken(token);

      if (!decodedUser) {
        throw new Error('Não foi possível validar o token recebido.');
      }

      localStorage.setItem(TOKEN_KEY, JSON.stringify({ _versao: 1, token } satisfies StoredAuthToken));
      dispatch({ type: 'login-succeeded', token, user: decodedUser });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar.';
      dispatch({ type: 'login-failed', error: message });
    }
  }, []);

  // Encerra a sessão e remove o token local.
  const logout = useCallback(() => {
    discardStoredToken();
    dispatch({ type: 'logged-out' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'error-cleared' }), []);

  // Mantém o valor derivado estável até a autenticação realmente mudar.
  const isAuthenticated = useMemo(
    () => !!authState.token && !!authState.user,
    [authState]
  );

  // Evita publicar um novo objeto no Context em cada renderização do Provider.
  const value = useMemo<AuthContextData>(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated,
      isLoggingIn: authState.isLoggingIn,
      error: authState.error,
      login,
      logout,
      clearError,
    }),
    [authState, isAuthenticated, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
