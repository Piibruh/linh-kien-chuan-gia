import { useAuthStore } from '../store/authStore';

export type ApiClientOptions = RequestInit & {
  /** Set false to skip Authorization header even if logged in */
  auth?: boolean;
};

/**
 * Lightweight client for future API integration.
 * Currently the app is local-state (Zustand) based, but this keeps auth header
 * behavior consistent with production patterns.
 */
export async function apiFetch(input: RequestInfo | URL, options: ApiClientOptions = {}) {
  const { auth = true, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const finalHeaders = new Headers(headers || undefined);
  if (auth && token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, {
    ...rest,
    headers: finalHeaders,
  });

  return res;
}
