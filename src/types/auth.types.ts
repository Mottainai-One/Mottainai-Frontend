export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DecodedToken {
  sub: string;
  name?: string;
  email?: string;
  exp: number;
  iat?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// Tipo do objeto do autenticação do context
export interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}