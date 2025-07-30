'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { SettingsProvider } from '@/contexts/settings-context';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <SettingsProvider>{children}</SettingsProvider>
    </AuthProvider>
  );
}
