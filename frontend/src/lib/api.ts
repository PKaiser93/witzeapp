const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // ← Cookies (refresh_token) werden automatisch mitgesendet
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Wrapper mit Access Token aus dem Memory (nicht localStorage!)
export async function apiFetchAuth(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
