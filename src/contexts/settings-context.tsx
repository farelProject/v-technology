'use client';

import { type Settings, type AiStyle, type AiModel } from '@/lib/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const defaultSettings: Settings = {
  theme: 'system',
  aiStyle: 'Cheerful',
  aiModel: 'General Assistant',
};

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem('vtech-settings');
        return item ? JSON.parse(item) : defaultSettings;
      } catch (error) {
        console.error(error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('vtech-settings', JSON.stringify(settings));

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (settings.theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
            .matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
          return;
        }

        root.classList.add(settings.theme);
      } catch (error) {
        console.error(error);
      }
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
