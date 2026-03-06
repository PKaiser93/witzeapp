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
  feature_report: boolean;
}

const defaultConfig: AppConfig = {
  maintenance: false,
  feature_comments: false, // ← false
  feature_likes: false, // ← false
  feature_register: true, // ← true lassen damit Registrierung erstmal geht
  feature_report: false,
};

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isPrivileged, setIsPrivileged] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsPrivileged(role === 'ADMIN' || role === 'BETA');

    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          maintenance: data.maintenance === 'true',
          feature_comments: data.feature_comments !== 'false',
          feature_likes: data.feature_likes !== 'false',
          feature_register: data.feature_register !== 'false',
          feature_report: data.feature_report !== 'false',
        });
      })
      .catch(() => {});
  }, []);

  const resolvedConfig = isPrivileged
    ? {
        ...config,
        feature_comments: true,
        feature_likes: true,
        feature_register: true,
        feature_report: true,
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
