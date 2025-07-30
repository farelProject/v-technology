
'use client';

import { AppShell } from '@/components/app-shell';
import { ChatView } from '@/components/chat/chat-view';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading, isFirstVisit, markFirstVisitDone } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('id');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    // If a specific chat is requested but user is not logged in, redirect to login
    if (chatId && !isLoading && !user) {
      router.push('/login');
    }
  }, [chatId, user, isLoading, router]);
  
  useEffect(() => {
    if (!isLoading && !user && isFirstVisit) {
        setShowWelcomeDialog(true);
    }
  }, [isLoading, user, isFirstVisit])
  
  const handleWelcomeDialogClose = () => {
      setShowWelcomeDialog(false);
      markFirstVisitDone();
  }

  return (
    <>
      <AppShell>
        <ChatView chatId={chatId} />
      </AppShell>
      <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to VTech AI!</AlertDialogTitle>
            <AlertDialogDescription>
              You are currently using the app as a guest. Log in to unlock all features and get a higher chat limit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleWelcomeDialogClose}>Stay as Guest</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/login" onClick={handleWelcomeDialogClose}>Login</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
