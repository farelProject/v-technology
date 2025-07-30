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
    
    // Add user message and a loading message optimistically
    const loadingMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: loadingMessageId, role: 'assistant', content: '...' },
    ]);


    startTransition(async () => {
      try {
        const { aiStyle, aiModel } = settings;
        const systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
        let assistantMessage: Message;

        if (mode === 'chat') {
           const result = await chat({ query: queryWithInstruction, file: fileDataUri });
           assistantMessage = {
             id: loadingMessageId,
             role: 'assistant',
             content: result.response,
             type: 'text',
           };
        } else if (mode === 'search') {
          const result = await chatWithSearch({ query: queryWithInstruction, file: fileDataUri });
          assistantMessage = {
            id: loadingMessageId,
            role: 'assistant',
            content: result.response,
            type: 'text',
            search_results: result.searchResults
          };
        } else if (mode === 'image') {
          const result = await generateImage({ prompt: input });
          assistantMessage = {
            id: loadingMessageId,
            role: 'assistant',
            content: `Here is the image you requested for: "${input}"`,
            type: 'image',
            image_url: result.imageUrl,
          };
        } else {
            throw new Error(`Unknown mode: ${mode}`);
        }
        
        // Replace the loading message with the actual response
        setMessages((prev) =>
            prev.map((m) => (m.id === loadingMessageId ? assistantMessage : m))
        );

      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to get response from AI. Please try again.',
          variant: 'destructive',
        });
        // Remove the loading message if an error occurs
        setMessages((prev) => prev.filter((m) => m.id !== loadingMessageId));
      }
    });
  };

  return {
    messages,
    isLoading: isPending,
    handleSend,
  };
}
