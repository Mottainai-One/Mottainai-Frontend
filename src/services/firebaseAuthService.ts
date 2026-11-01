import type { LoginCredentials } from '@/types/auth.types';

export async function getFirebaseIdToken(credentials: LoginCredentials): Promise<string> {
  try {
    const url = import.meta.env.VITE_FIREBASE_AUTH_URL as string | undefined;
    const key = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
    if (!url || !key) throw new Error('O acesso Firebase ainda não foi configurado neste ambiente.');
    const response = await fetch(`${url}?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password, returnSecureToken: true }),
    });
    const data: unknown = await response.json();
    if (!response.ok) throw new Error('Não foi possível autenticar. Confira e-mail e senha.');
    if (typeof data !== 'object' || data === null || !('idToken' in data) || typeof data.idToken !== 'string') {
      throw new Error('A resposta de autenticação não contém um token válido.');
    }
    return data.idToken;
  } catch (error) {
    throw new Error(error instanceof TypeError ? 'Não foi possível acessar a autenticação Firebase.'
      : error instanceof Error ? error.message : 'Falha na autenticação.', { cause: error });
  }
}
