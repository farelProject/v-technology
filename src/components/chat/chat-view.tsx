'use client';

import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInputForm } from './chat-input-form';

export function ChatView({ chatId }: { chatId: string | null }) {
  const { messages, isLoading, handleSend } = useChat(chatId);

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
          <ChatInputForm onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
