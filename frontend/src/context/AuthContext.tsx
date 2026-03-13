'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type AuthUser = {
  id: number;
  email: string;
  username: string;
  role: string;
  isVerified?: boolean;
} | null;

type AuthContextType = {
  user: AuthUser;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  // neu: direkter Login mit vorhandenem Access Token (z.B. Verify-Email)
  loginWithToken: (accessToken: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function parseUserFromToken(token: string): AuthUser {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true); // true bis Silent Refresh abgeschlossen

  // Beim App-Start: Silent Refresh via Cookie
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.access_token);
          setUser(parseUserFromToken(data.access_token));
        }
      } catch {
        // kein gültiger Cookie → nicht eingeloggt
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? 'Login fehlgeschlagen.');
    }
    const data = await res.json();
    setAccessToken(data.access_token);
    setUser(parseUserFromToken(data.access_token));
  }, []);

  // neu: wird z.B. von VerifyEmailPage genutzt
  const loginWithToken = useCallback((token: string) => {
    setAccessToken(token);
    setUser(parseUserFromToken(token));
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [accessToken]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.access_token);
      setUser(parseUserFromToken(data.access_token));
      return data.access_token;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        loginWithToken,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden');
  return ctx;
}
