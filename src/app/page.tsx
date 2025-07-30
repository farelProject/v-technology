'use client';

import { AppShell } from '@/components/app-shell';
import { ChatView } from '@/components/chat/chat-view';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('id');

  useEffect(() => {
    // If a specific chat is requested but user is not logged in, redirect to login
    if (chatId && !isLoading && !user) {
      router.push('/login');
    }
  }, [chatId, user, isLoading, router]);

  return (
    <AppShell>
      <ChatView chatId={chatId} />
    </AppShell>
  );
}
