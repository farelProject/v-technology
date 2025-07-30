'use client';

import { useState, useTransition } from 'react';
import { useToast } from './use-toast';
import { chatWithSearch } from '@/ai/flows/chat-with-search';
import { generateImage } from '@/ai/flows/generate-image';
import { chat } from '@/ai/flows/chat';
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
        const { aiStyle, aiModel } = settings;
        const systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
        let assistantMessage: Message;

        if (mode === 'chat') {
           const result = await chat({ query: queryWithInstruction, file: fileDataUri });
           assistantMessage = {
             id: loadingMessage.id,
             role: 'assistant',
             content: result.response,
             type: 'text',
           };
        } else if (mode === 'search') {
          const result = await chatWithSearch({ query: queryWithInstruction, file: fileDataUri });
          assistantMessage = {
            id: loadingMessage.id,
            role: 'assistant',
            content: result.response,
            type: 'text',
            search_results: result.searchResults
          };
        } else if (mode === 'image') {
          const result = await generateImage({ prompt: input });
          assistantMessage = {
            id: loadingMessage.id,
            role: 'assistant',
            content: `Here is the image you requested for: "${input}"`,
            type: 'image',
            image_url: result.imageUrl,
          };
        } else {
            throw new Error(`Unknown mode: ${mode}`);
        }
        
        setMessages((prev) =>
            prev.map((m) => (m.id === loadingMessage.id ? assistantMessage : m))
        );

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
