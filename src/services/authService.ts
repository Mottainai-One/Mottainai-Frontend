import type { LoginCredentials, LoginResponse } from '@/types/auth.types';
import type { ApiSession } from '@/types/api.types';
import { apiRequest, setApiSession, endApiSession } from './apiClient';
import { getFirebaseIdToken } from './firebaseAuthService';
import { getCurrentProfile } from './profileService';

// A autenticação simulada fica restrita à auditoria Lighthouse.
export const isMockAuthenticationEnabled =
  import.meta.env.MODE === 'lighthouse';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  if (isMockAuthenticationEnabled) {
    const { loginWithMockCredentials } = await import('@/services/mockAuthService');
    return loginWithMockCredentials(credentials);
  }

  try {
    const firebaseIdToken = await getFirebaseIdToken(credentials);
    const session = await apiRequest<ApiSession>('/auth/login', {
      method: 'POST', authenticated: false, body: { firebaseIdToken, password: credentials.password },
    });
    setApiSession(session);
    const profile = await getCurrentProfile();
    return { token: session.accessToken, user: { id: String(profile.id), name: profile.name, email: profile.email ?? '' } };
  } catch (error) {
    setApiSession(null);
    throw error;
  }
}

export const logout = endApiSession;
