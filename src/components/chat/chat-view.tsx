'use client';

import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInputForm } from './chat-input-form';

export function ChatView() {
  const { messages, isLoading, handleSend } = useChat();

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="w-full max-w-2xl mx-auto p-4">
        <ChatInputForm onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
