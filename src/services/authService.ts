import type { LoginCredentials, LoginResponse } from '@/types/auth.types';

// O mock existe somente para desenvolvimento local e auditoria Lighthouse.
export const isMockAuthenticationEnabled =
  import.meta.env.DEV || import.meta.env.MODE === 'lighthouse';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (import.meta.env.DEV || import.meta.env.MODE === 'lighthouse') {
    const { loginWithMockCredentials } = await import('@/services/mockAuthService');
    return loginWithMockCredentials(credentials);
  }

  throw new Error('A autenticação real não está configurada neste ambiente.');
}
