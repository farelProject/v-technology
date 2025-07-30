'use client';

import { useState, useTransition } from 'react';
import { useToast } from './use-toast';
import { chatWithSearch } from '@/ai/flows/chat-with-search';
import { generateImage } from '@/ai/flows/generate-image';
import type { Message, AiMode } from '@/lib/types';
import { useSettings } from '@/contexts/settings-context';

export function useChat() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSend = (mode: AiMode, input: string, fileDataUri?: string) => {
    if (!input.trim() && !fileDataUri) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image_url: fileDataUri,
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '...',
    };
    setMessages((prev) => [...prev, loadingMessage]);

    startTransition(async () => {
      try {
        if (mode === 'chat' || mode === 'search') {
          const { aiStyle, aiModel } = settings;
          let systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
          if (mode === 'search') {
            systemInstruction += ' Selalu gunakan webSearch tool.';
          }
          const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
          
          const result = await chatWithSearch({ query: queryWithInstruction, file: fileDataUri });
          
          const assistantMessage: Message = {
            id: loadingMessage.id,
            role: 'assistant',
            content: result.response,
            type: 'text',
            search_results: result.searchResults
          };
          setMessages((prev) =>
            prev.map((m) => (m.id === loadingMessage.id ? assistantMessage : m))
          );
        } else if (mode === 'image') {
          const result = await generateImage({ prompt: input });
          const assistantMessage: Message = {
            id: loadingMessage.id,
            role: 'assistant',
            content: `Here is the image you requested for: "${input}"`,
            type: 'image',
            image_url: result.imageUrl,
          };
          setMessages((prev) =>
            prev.map((m) => (m.id === loadingMessage.id ? assistantMessage : m))
          );
        }
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to get response from AI. Please try again.',
          variant: 'destructive',
        });
        setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));
      }
    });
  };

  return {
    messages,
    isLoading: isPending,
    handleSend,
  };
}
