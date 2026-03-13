const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function fetchWithAuth(
  url: string,
  accessToken: string | null,
  refreshFn: () => Promise<string | null>,
  options: RequestInit = {}
): Promise<Response> {
  const makeRequest = (token: string | null) =>
    fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const res = await makeRequest(accessToken);

  if (res.status === 401) {
    // Access Token abgelaufen → Silent Refresh via Cookie
    const newToken = await refreshFn();
    if (!newToken) {
      window.location.href = '/login';
      return res;
    }
    return makeRequest(newToken);
  }

  return res;
}

// Convenience-Funktion für einfache API-Calls ohne Auth
export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
}
