
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

async function uploadImageToServer(base64Image: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image, userId }),
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
        // For new chats, create a session object but don't save it yet.
        const newSession = await createNewChatSession(user.id);
        setSession(newSession);
        setMessages(newSession.messages); // Should be []
      }
    };

    loadSession();
  }, [chatId, user, router, toast]);

  const handleSaveSession = useCallback(
    async (updatedMessages: Message[], currentSession: ChatSession) => {
      if (!user) return null;

      let sessionToSave = { ...currentSession, messages: updatedMessages };

      // Set title only if it's not already set
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

    const userMessageId = `${Date.now()}-${Math.random()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: input,
      userId: user.id,
      isLoading: !!fileDataUri
    };
    
    setMessages((prev) => [...prev, userMessage]);

    startTransition(async () => {
      let fileForAi: string | undefined = fileDataUri;

      if (fileDataUri) {
          const uploadResult = await uploadImageToServer(fileDataUri, user.id);
          if (uploadResult.success && uploadResult.url) {
            setMessages(prev => prev.map(msg => msg.id === userMessageId ? {...msg, isLoading: false, image_url: uploadResult.url} : msg));
          } else {
             toast({
                title: 'Image Upload Failed',
                description: uploadResult.error || 'Could not upload your image.',
                variant: 'destructive',
            });
            setMessages((prev) => prev.filter((msg) => msg.id !== userMessageId));
            return;
          }
      }
      
      const loadingMessageId = `${Date.now()}`;
      setMessages((prev) => [...prev, { id: loadingMessageId, role: 'assistant', content: '...', userId: 'assistant' }]);

      try {
        const { aiStyle, aiModel } = settings;
        const systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
        let assistantMessage: Message;

        if (mode === 'chat') {
          const result = await chat({ query: queryWithInstruction, file: fileForAi });
          assistantMessage = {
            id: loadingMessageId,
            role: 'assistant',
            content: result.response,
            type: 'text',
            userId: 'assistant',
          };
        } else if (mode === 'search') {
          const result = await chatWithSearch({ query: queryWithInstruction, file: fileForAi });
          assistantMessage = {
            id: loadingMessageId,
            role: 'assistant',
            content: result.response,
            type: 'text',
            search_results: result.searchResults,
            userId: 'assistant',
          };
        } else if (mode === 'image') {
          const result = await generateImage({ prompt: input });
          const uploadResult = await uploadImageToServer(result.imageUrl, user.id);
          
          let finalImageUrl = result.imageUrl; // fallback to data URI
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
          } else {
             toast({
                title: 'Image Hosting Failed',
                description: 'Could not save the generated image to the server.',
                variant: 'destructive'
            });
          }

          assistantMessage = {
            id: loadingMessageId,
            role: 'assistant',
            content: `Here is the image you requested for: "${input}"`,
            type: 'image',
            image_url: finalImageUrl,
            userId: 'assistant',
          };
        } else {
          throw new Error(`Unknown mode: ${mode}`);
        }
        
        // This is a safer way to update the loading message
        setMessages((prev) => 
            prev.map((msg) =>
                msg.id === loadingMessageId ? assistantMessage : msg
            )
        );
        
        // This is a safer way to save the session
        setMessages((currentMessages) => {
          handleSaveSession(currentMessages, session).then((savedSession) => {
            if (savedSession) {
              setSession(savedSession);
              if (!chatId) {
                // Navigate to the new chat URL without a full page reload
                router.replace(`/?id=${savedSession.id}`, { scroll: false });
              }
            }
          });
          return currentMessages;
        });

      } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'Gagal mendapatkan respons dari AI.';
        let userFriendlyMessage = 'Gagal mendapatkan respons dari AI. Silakan coba lagi.';
        
        if (errorMessage.includes('overloaded')) {
            userFriendlyMessage = 'Model AI sedang sibuk. Silakan coba lagi beberapa saat.';
        }

        setMessages(prev => prev.map(msg => msg.id === loadingMessageId ? {...msg, content: userFriendlyMessage } : msg));

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
