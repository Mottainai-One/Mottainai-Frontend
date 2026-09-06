import type { LoginCredentials, LoginResponse } from '@/types/auth.types';

// Informações mockadas para teste
const MOCK_EMAIL = 'admin@123';
const MOCK_PASSWORD = '321123tudosobre2';
const MOCK_DELAY_MS = 3000;

// Rebecca mude aqui!!
function base64UrlEncode(payload: object): string {
  const base64 = btoa(JSON.stringify(payload));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Rebecca mude aqui!!

function createFakeJwt(email: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const payload = {
    sub: 'mock-user-id-1',
    email,
    name: 'Administrador',
    iat: nowInSeconds,
    exp: nowInSeconds + 60 * 60, 
  };

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.mock-signature`;
}

/**
 * Simula uma chamada POST /auth/login.
 * Quando a API estiver pronta, troca o corpo desta função por:
 *
 * export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
 *   const { data } = await httpClient.post('/auth/login', credentials);
 *   return data;
 * }
 */

// Login Fake
export function login({ email, password }: LoginCredentials): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isValid = (email === MOCK_EMAIL) && (password === MOCK_PASSWORD);

      if (!isValid) {
        reject(new Error('Email ou senha inválidos.'));
        return;
      }

      resolve({ token: createFakeJwt(email) });
    }, MOCK_DELAY_MS);
  });
}