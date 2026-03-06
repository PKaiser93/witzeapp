'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AppConfig {
  maintenance: boolean;
  feature_comments: boolean;
  feature_likes: boolean;
  feature_register: boolean;
}

const defaultConfig: AppConfig = {
  maintenance: false,
  feature_comments: true,
  feature_likes: true,
  feature_register: true,
};

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'ADMIN');

    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          maintenance: data.maintenance === 'true',
          feature_comments: data.feature_comments !== 'false',
          feature_likes: data.feature_likes !== 'false',
          feature_register: data.feature_register !== 'false',
        });
      })
      .catch(() => {});
  }, []);

  const resolvedConfig = isAdmin
    ? {
        ...config,
        feature_comments: true,
        feature_likes: true,
        feature_register: true,
        maintenance: false,
      }
    : config;

  return (
    <AppConfigContext.Provider value={resolvedConfig}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const config = useContext(AppConfigContext);
  return config;
}
