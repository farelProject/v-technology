
'use client';

import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInputForm } from './chat-input-form';
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
import { useState } from 'react';
import Link from 'next/link';

export function ChatView({ chatId }: { chatId: string | null }) {
  const { messages, isLoading, handleSend } = useChat(chatId);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitDialogContent, setLimitDialogContent] = useState({ title: '', description: '' });

  const onLimitExceeded = () => {
    setLimitDialogContent({
        title: 'Chat Limit Reached',
        description: 'You have reached your chat limit. Please log in or wait 24 hours for it to reset.'
    });
    setShowLimitDialog(true);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto pb-4">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          isNewChat={!chatId}
        />
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm mt-auto">
        <div className="w-full max-w-2xl mx-auto p-4">
          <ChatInputForm onSend={handleSend} isLoading={isLoading} onLimitExceeded={onLimitExceeded} />
        </div>
      </div>
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{limitDialogContent.title}</AlertDialogTitle>
                <AlertDialogDescription>{limitDialogContent.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <Link href="/login">Login</Link>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
