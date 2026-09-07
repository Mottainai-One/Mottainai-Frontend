import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextData } from '@/types/auth.types';

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }

  return context;
}

