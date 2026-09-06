import { createContext } from 'react';
import type { AuthContextData } from '@/types/auth.types';

// Criando o contexto para repassar para tudo
export const AuthContext = createContext<AuthContextData | undefined>(undefined);