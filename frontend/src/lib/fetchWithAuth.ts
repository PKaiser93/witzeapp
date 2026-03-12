const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    // Refresh Token auch abgelaufen → ausloggen
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json();

  localStorage.setItem('token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  if (data.user?.role) {
    localStorage.setItem('role', data.user.role);
  }
  if (data.user?.username) {
    localStorage.setItem('username', data.user.username);
  }

  return data.access_token;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token');

  if (!token) {
    localStorage.clear();
    window.location.href = '/login';
    return new Response(null, { status: 401 });
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
    };
    return fetch(url, { ...options, headers: retryHeaders });
  }

  return res;
}
