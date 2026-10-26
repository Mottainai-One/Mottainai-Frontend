import type { LoginCredentials, LoginResponse } from '@/types/auth.types';

/** Login sem servidor, habilitado somente em desenvolvimento e no build Lighthouse. */
export async function loginWithMockCredentials(
  { email, password }: LoginCredentials,
): Promise<LoginResponse> {
  if (!email.trim() || !password) {
    throw new Error('Informe um e-mail e uma senha válidos.');
  }

  const base64UrlEncode = (payload: object): string => {
    const base64 = btoa(JSON.stringify(payload));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'mock-user-id-1',
    email: email.trim(),
    name: 'Administrador de demonstração',
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 60,
  };

  return {
    token: `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.mock-signature`,
  };
}
