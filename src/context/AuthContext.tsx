import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
    setIsLoading(false);
    }, []);

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
  await new Promise((r) => setTimeout(r, 500));
  return 'fake-token-123';
}