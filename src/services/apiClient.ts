import type { ApiRequestOptions, ApiSession } from '@/types/api.types';

export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// Sessão real fica em memória: um recarregamento exige novo login.
let session: ApiSession | null = null;
let refreshOperation: Promise<void> | null = null;

export function serviceError(error: unknown, message: string): Error {
  return error instanceof Error ? error : new Error(message, { cause: error });
}

export function setApiSession(value: ApiSession | null): void {
  session = value;
}

function expireSession(): void {
  session = null;
  window.dispatchEvent(new Event('mottainai:session-expired'));
}

async function refreshSession(): Promise<void> {
  if (!session) throw new ApiRequestError('Entre novamente para continuar.', 401);
  const previous = session;
  try {
    const next = await apiRequest<ApiSession>('/auth/refresh', {
      method: 'POST', authenticated: false, body: { refreshToken: previous.refreshToken },
    });
    if (session === previous) session = next;
  } catch (error) {
    if (session === previous) expireSession();
    throw error;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, authenticated = true, ...init } = options;
  try {
    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!base) throw new Error('A URL da API não foi configurada neste ambiente.');
    if (authenticated && !session) throw new ApiRequestError('Entre na sua conta para continuar.', 401);
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    const send = () => {
      if (authenticated && session) headers.set('Authorization', `Bearer ${session.accessToken}`);
      return fetch(`${base.replace(/\/$/, '')}${path}`, {
        ...init, headers, body: body === undefined ? undefined : JSON.stringify(body),
      });
    };
    let response = await send();
    if (response.status === 401 && authenticated && session) {
      refreshOperation ??= refreshSession().finally(() => { refreshOperation = null; });
      await refreshOperation;
      if (!session) throw new ApiRequestError('Sua sessão terminou. Entre novamente.', 401);
      response = await send();
    }
    if (!response.ok) {
      if (response.status === 401 && authenticated) expireSession();
      const payload: unknown = await response.json().catch(() => null);
      const message = typeof payload === 'object' && payload !== null && 'message' in payload
        && typeof payload.message === 'string' ? payload.message :
        response.status === 403 ? 'Sua conta não tem permissão para esta operação.' :
        `Não foi possível concluir a operação (HTTP ${response.status}).`;
      throw new ApiRequestError(message, response.status);
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    if (error instanceof ApiRequestError) throw error;
    throw new Error(error instanceof TypeError
      ? 'Não foi possível acessar a API. Verifique sua conexão e tente novamente.'
      : error instanceof Error ? error.message : 'Falha ao consultar a API.', { cause: error });
  }
}

export async function endApiSession(): Promise<void> {
  const current = session;
  try {
    if (current) await apiRequest<void>('/auth/logout', {
      method: 'POST', body: { refreshToken: current.refreshToken },
    });
  } catch (error) {
    throw serviceError(error, 'Não foi possível revogar a sessão no servidor.');
  } finally {
    setApiSession(null);
  }
}
