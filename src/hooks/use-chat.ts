
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { chatWithSearch } from '@/ai/flows/chat-with-search';
import { generateImage } from '@/ai/flows/generate-image';
import { chat } from '@/ai/flows/chat';
import type { Message, AiMode, ChatSession } from '@/lib/types';
import { useSettings } from '@/contexts/settings-context';
import { useAuth } from '@/contexts/auth-context';
import {
  getChatSession,
  saveChatSession,
  createNewChatSession,
} from '@/lib/chat-service';

async function uploadImageToServer(base64Image: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to upload image.' };
    }

    return { success: true, url: result.url };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { success: false, error: 'An unexpected error occurred during upload.' };
  }
}


export function useChat(chatId: string | null) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setSession(null);
      return;
    }

    const loadSession = async () => {
      if (chatId) {
        const loadedSession = await getChatSession(user.id, chatId);
        if (loadedSession) {
          setSession(loadedSession);
          setMessages(loadedSession.messages);
        } else {
          toast({ title: 'Chat not found', variant: 'destructive' });
          router.push('/');
        }
      } else {
        const newSession = await createNewChatSession(user.id);
        setSession(newSession);
        setMessages(newSession.messages);
      }
    };

    loadSession();
  }, [chatId, user, router, toast]);

  const handleSaveSession = useCallback(
    async (updatedMessages: Message[], currentSession: ChatSession) => {
      if (!user) return null;

      let sessionToSave = { ...currentSession, messages: updatedMessages };

      if (updatedMessages.length > 0 && !sessionToSave.title) {
        const firstUserMessage = updatedMessages.find((m) => m.role === 'user');
        if (firstUserMessage) {
          sessionToSave.title = firstUserMessage.content.substring(0, 50) + '...';
        }
      }

      await saveChatSession(user.id, sessionToSave);
      return sessionToSave;
    },
    [user]
  );

  const handleSend = (mode: AiMode, input: string, fileDataUri?: string) => {
    if (!user) {
      toast({ title: 'Please log in to chat.', variant: 'destructive' });
      return;
    }
    if (!input.trim() && !fileDataUri) return;
    if (!session) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      content: input,
      userId: user.id,
      isLoading: !!fileDataUri
    };
    
    setMessages((prev) => [...prev, userMessage]);

    startTransition(async () => {
      let currentMessages = [...messages, userMessage];
      let fileForAi: string | undefined = fileDataUri;

      if (fileDataUri) {
          const uploadResult = await uploadImageToServer(fileDataUri);
          if (uploadResult.success && uploadResult.url) {
            // Update the user message to include the image_url and set isLoading to false
            currentMessages = currentMessages.map(msg => 
              msg.id === userMessage.id 
                ? {...msg, isLoading: false, image_url: uploadResult.url} 
                : msg
            );
            setMessages(currentMessages);
          } else {
             toast({
                title: 'Image Upload Failed',
                description: uploadResult.error || 'Could not upload your image.',
                variant: 'destructive',
            });
            // Remove the message that failed to upload
            setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
            return;
          }
      }
      
      const loadingMessageId = `${Date.now()}`;
      const loadingMessage: Message = { id: loadingMessageId, role: 'assistant', content: '...', userId: 'assistant' };
      
      setMessages([...currentMessages, loadingMessage]);

      try {
        const { aiStyle, aiModel } = settings;
        const systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
        let assistantResponsePayload: Omit<Message, 'id' | 'role' | 'userId'>;

        if (mode === 'chat') {
          const result = await chat({ query: queryWithInstruction, file: fileForAi });
          assistantResponsePayload = {
            content: result.response,
            type: 'text',
          };
        } else if (mode === 'search') {
          const result = await chatWithSearch({ query: queryWithInstruction, file: fileForAi });
          assistantResponsePayload = {
            content: result.response,
            type: 'text',
            search_results: result.searchResults,
          };
        } else if (mode === 'image') {
          const result = await generateImage({ prompt: input });
          const uploadResult = await uploadImageToServer(result.imageUrl);
          
          let finalImageUrl = result.imageUrl; 
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
          } else {
             toast({
                title: 'Image Hosting Failed',
                description: 'Could not save the generated image to the server.',
                variant: 'destructive'
            });
          }

          assistantResponsePayload = {
            content: `Here is the image you requested for: "${input}"`,
            type: 'image',
            image_url: finalImageUrl,
          };
        } else {
          throw new Error(`Unknown mode: ${mode}`);
        }
        
        const finalAssistantMessage: Message = {
            id: loadingMessageId,
            role: 'assistant',
            userId: 'assistant',
            ...assistantResponsePayload
        };

        const finalMessages = [...currentMessages, finalAssistantMessage];
        setMessages(finalMessages);
        
        const savedSession = await handleSaveSession(finalMessages, session);
        if (savedSession) {
            setSession(savedSession);
            if (!chatId) {
                router.replace(`/?id=${savedSession.id}`, { scroll: false });
            }
        }

      } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'Gagal mendapatkan respons dari AI.';
        let userFriendlyMessage = 'Gagal mendapatkan respons dari AI. Silakan coba lagi.';
        
        if (errorMessage.includes('overloaded')) {
            userFriendlyMessage = 'Model AI sedang sibuk. Silakan coba lagi beberapa saat.';
        }

        const finalAssistantMessage: Message = {
            id: loadingMessageId,
            role: 'assistant',
            userId: 'assistant',
            content: userFriendlyMessage,
        };

        setMessages([...currentMessages, finalAssistantMessage]);

        toast({
          title: 'Error',
          description: userFriendlyMessage,
          variant: 'destructive',
        });
      }
    });
  };

  return {
    messages,
    isLoading: isPending,
    handleSend,
  };
}
