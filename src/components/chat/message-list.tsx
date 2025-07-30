'use client';

import React, { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { ChatMessage } from './chat-message';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
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
