const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function fetchWithRefresh(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(url, { ...options, headers });

  // Token abgelaufen → erneuern
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      // Kein Refresh Token → ausloggen
      localStorage.clear();
      window.location.href = '/login';
      return res;
    }

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshRes.ok) {
      // Refresh fehlgeschlagen → ausloggen
      localStorage.clear();
      window.location.href = '/login';
      return res;
    }

    const { access_token } = await refreshRes.json();
    localStorage.setItem('token', access_token);

    // Original Request mit neuem Token wiederholen
    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${access_token}`,
    };
    res = await fetch(url, { ...options, headers: newHeaders });
  }

  return res;
}
