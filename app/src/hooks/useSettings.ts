import { useState, useCallback, useEffect } from 'react';

export interface AppSettings {
  soundEnabled: boolean;
  dailyNewWordsLimit: number;
  autoBackup: boolean;
  autoBackupInterval: number;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  dailyNewWordsLimit: 20,
  autoBackup: true,
  autoBackupInterval: 24,
  theme: 'system',
};

const STORAGE_KEY = 'sarawords_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      console.error('Failed to load settings');
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      console.error('Failed to save settings');
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const toggleAutoBackup = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoBackup: !prev.autoBackup }));
  }, []);

  const setTheme = useCallback((theme: AppSettings['theme']) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleSound,
    toggleAutoBackup,
    setTheme,
  };
}
