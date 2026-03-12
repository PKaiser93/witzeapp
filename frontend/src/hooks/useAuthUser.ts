'use client';
type AuthUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  isVerified?: boolean;
} | null;

export function useAuthUser(): AuthUser {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const [, payloadBase64] = token.split('.');
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson) as {
      sub: number;
      email: string;
      username: string;
      role: string;
      isVerified?: boolean;
      exp?: number;
    };

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      isVerified: payload.isVerified,
    };
  } catch {
    return null;
  }
}
