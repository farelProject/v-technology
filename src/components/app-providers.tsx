'use client';

import { SettingsProvider } from '@/contexts/settings-context';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
