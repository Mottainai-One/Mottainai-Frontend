import type { LoginCredentials, LoginResponse } from '@/types/auth.types';
import type { ApiSession } from '@/types/api.types';
import { apiRequest, setApiSession, endApiSession } from './apiClient';
import { getFirebaseIdToken } from './firebaseAuthService';
import { getCurrentProfile } from './profileService';

let authenticationAttempt = 0;

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const attempt = ++authenticationAttempt;
  const checkAttempt = () => {
    if (attempt !== authenticationAttempt) throw new Error('Esta tentativa de acesso foi substituída.');
  };
  try {
    const firebaseIdToken = await getFirebaseIdToken(credentials);
    checkAttempt();
    const session = await apiRequest<ApiSession>('/auth/login', {
      method: 'POST', authenticated: false, body: { firebaseIdToken, password: credentials.apiPassword ?? credentials.password },
    });
    checkAttempt();
    setApiSession(session);
    const profile = await getCurrentProfile();
    checkAttempt();
    return { token: session.accessToken, user: { id: String(profile.id), name: profile.name, email: profile.email ?? '' } };
  } catch (error) {
    if (attempt === authenticationAttempt) setApiSession(null);
    throw error;
  }
}

export async function logout(): Promise<void> {
  authenticationAttempt += 1;
  return endApiSession();
}
