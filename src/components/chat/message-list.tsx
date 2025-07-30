'use client';

import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import type { AiMode } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (mode: AiMode, message: string, fileDataUri?: string) => void;
  isNewChat: boolean;
}

export function MessageList({
  messages,
  isLoading,
  onSend,
  isNewChat,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    onSend('chat', question);
  };

  // Show suggestions if messages are loaded, the list is empty, user is logged in, and not loading.
  const showSuggestions = messages && messages.length === 0 && !isLoading && user;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {showSuggestions && (
        <SuggestedQuestions onQuestionClick={handleQuestionClick} />
      )}
      <div className="space-y-6">
        {messages && messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      <div ref={scrollRef} />
    </div>
  );
}
