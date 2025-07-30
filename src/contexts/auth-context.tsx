
'use client';

import { StoredUser, ChatLimit } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const GUEST_LIMIT = 10;
const GUEST_USER_ID = 'guest';

interface AuthContextType {
  user: Omit<StoredUser, 'password'> | null;
  isLoading: boolean;
  login: (userData: Omit<StoredUser, 'password'>) => void;
  logout: () => void;
  chatLimit: ChatLimit | null;
  updateChatLimit: (newLimit: Partial<ChatLimit>) => void;
  isFirstVisit: boolean;
  markFirstVisitDone: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialGuestLimit(): ChatLimit {
    if (typeof window === 'undefined') {
        return { count: 0, limit: GUEST_LIMIT, lastReset: new Date().toISOString() };
    }
    try {
        const storedLimit = localStorage.getItem('vtech-guest-limit');
        if (storedLimit) {
            const parsed = JSON.parse(storedLimit) as ChatLimit;
            // Check if it needs reset
            const lastReset = new Date(parsed.lastReset);
            const now = new Date();
            if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
                return { count: 0, limit: GUEST_LIMIT, lastReset: now.toISOString() };
            }
            return parsed;
        }
    } catch (error) {
        console.error("Failed to parse guest limit from localStorage", error);
    }
    return { count: 0, limit: GUEST_LIMIT, lastReset: new Date().toISOString() };
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<StoredUser, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLimit, setChatLimit] = useState<ChatLimit | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const router = useRouter();
  
  const markFirstVisitDone = useCallback(() => {
    try {
        localStorage.setItem('vtech-first-visit-done', 'true');
        setIsFirstVisit(false);
    } catch (error) {
        console.error("Could not set first visit flag in localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vtech-user');
      const firstVisitDone = localStorage.getItem('vtech-first-visit-done') === 'true';

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as Omit<StoredUser, 'password'>;
        setUser(parsedUser);
        setChatLimit(parsedUser.chatLimit);
        setIsFirstVisit(false); // Logged in users are not "first-time guests"
      } else {
        // Guest user
        setChatLimit(getInitialGuestLimit());
        if (!firstVisitDone) {
            setIsFirstVisit(true);
        }
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.clear(); // Clear potentially corrupted storage
      setChatLimit(getInitialGuestLimit());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData: Omit<StoredUser, 'password'>) => {
    localStorage.setItem('vtech-user', JSON.stringify(userData));
    setUser(userData);
    setChatLimit(userData.chatLimit);
    localStorage.removeItem('vtech-guest-limit'); // Clean up guest data
    localStorage.removeItem('vtech-first-visit-done'); // Clean up guest flag
    setIsFirstVisit(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vtech-user');
    setUser(null);
    setChatLimit(getInitialGuestLimit());
    router.push('/login');
    router.refresh(); // Forces a refresh to clear state
  }, [router]);

  const updateChatLimit = useCallback((newLimitData: Partial<ChatLimit>) => {
      setChatLimit(prev => {
          if (!prev) return null;
          const updated = { ...prev, ...newLimitData };
          
          if (!user) { // Is guest
            localStorage.setItem('vtech-guest-limit', JSON.stringify(updated));
          }
          
          return updated;
      });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, chatLimit, updateChatLimit, isFirstVisit, markFirstVisitDone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
