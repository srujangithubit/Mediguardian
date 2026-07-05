const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)mg-auth-token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  return token === "undefined" ? null : token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Only set default Content-Type to application/json if not provided
  // and if the body is not FormData (fetch handles FormData boundaries automatically)
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  // Unwrap NestJS transform interceptor payload if present
  return (json && json.success !== undefined && json.data !== undefined) ? json.data : json;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, data?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options,
    }),

  patch: <T>(path: string, data?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PATCH',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options,
    }),

  put: <T>(path: string, data?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'DELETE', ...options }),
};
