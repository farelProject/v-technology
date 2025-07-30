'use client';

import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import type { AiMode } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (mode: AiMode, message: string, fileDataUri?: string) => void;
}

export function MessageList({ messages, isLoading, onSend }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    onSend('chat', question);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {messages.length === 0 && !isLoading && (
        <SuggestedQuestions onQuestionClick={handleQuestionClick} />
      )}
      <div className="space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length-1]?.role !== 'assistant' && (
           <ChatMessage message={{id: 'loading', role: 'assistant', content: '...'}} />
        )}
      </div>
      <div ref={scrollRef} />
    </div>
  );
}
