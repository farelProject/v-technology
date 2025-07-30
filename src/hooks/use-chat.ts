
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
  getAndUpdateChatLimit,
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
  const { user, chatLimit, updateChatLimit } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const userId = user?.id || 'guest';

  useEffect(() => {
    // Session loading is now handled based on user state change.
    const loadSession = async () => {
      if (chatId && user) { // Only load session if there's a user
        const loadedSession = await getChatSession(user.id, chatId);
        if (loadedSession) {
          setSession(loadedSession);
          setMessages(loadedSession.messages);
        } else {
          toast({ title: 'Chat not found', variant: 'destructive' });
          router.push('/');
        }
      } else {
        const newSession = await createNewChatSession(userId);
        setSession(newSession);
        setMessages(newSession.messages);
      }
    };

    loadSession();
  }, [chatId, user, router, toast]); // Rerun when user changes (login/logout)


  const handleSaveSession = useCallback(
    async (updatedMessages: Message[], currentSession: ChatSession) => {
      if (!user) return null; // Only save sessions for logged-in users

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
    if (!input.trim() && !fileDataUri) return;
    if (!session) return;
    if (!chatLimit) return;

    // Guest restrictions
    if (!user && (mode === 'image' || mode === 'search' || !!fileDataUri)) {
        toast({
            title: 'Feature Locked',
            description: 'Please log in to use image generation, search, and file uploads.',
            variant: 'destructive',
        });
        return;
    }

    // Check limits
    if (chatLimit.count >= chatLimit.limit) {
        toast({
            title: 'Chat Limit Reached',
            description: user ? 'Your daily limit will reset in 24 hours.' : 'Please log in to continue chatting.',
            variant: 'destructive',
        });
        return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      content: input,
      userId: userId,
      isLoading: !!fileDataUri
    };
    
    setMessages((prev) => [...prev, userMessage]);

    startTransition(async () => {
      let currentMessages = [...messages, userMessage];
      let fileForAi: string | undefined = fileDataUri;

      if (fileDataUri) {
          const uploadResult = await uploadImageToServer(fileDataUri);
          if (uploadResult.success && uploadResult.url) {
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
            setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
            return;
          }
      }
      
      const loadingMessageId = `${Date.now()}`;
      const loadingMessage: Message = { id: loadingMessageId, role: 'assistant', content: '...', userId: 'assistant' };
      
      setMessages([...currentMessages, loadingMessage]);

      try {
        // Decrement and check limit server-side for users, client-side for guests
        let newLimit: { count: number; limit: number; } | null = null;
        if(user) {
            newLimit = await getAndUpdateChatLimit(user.id);
        } else {
            newLimit = { count: chatLimit.count + 1, limit: chatLimit.limit };
            updateChatLimit({ count: newLimit.count });
        }

        if (!newLimit || newLimit.count > newLimit.limit) {
             setMessages(messages.filter(m => m.id !== loadingMessageId));
             toast({
                title: 'Chat Limit Reached',
                description: user ? 'Your daily limit will reset in 24 hours.' : 'Please log in to continue chatting.',
                variant: 'destructive',
             });
             return;
        }

        // Show warning if limit is low
        if (newLimit.limit - newLimit.count <= 2 && newLimit.limit - newLimit.count > 0) {
            toast({
                title: 'Limit Warning',
                description: `You have ${newLimit.limit - newLimit.count} messages left.`
            });
        }

        const { aiStyle, aiModel } = settings;
        const systemInstruction = `AI Style: ${aiStyle}, AI Model: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nQuery: ${input}`;
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
            if (!chatId && user) {
                router.replace(`/?id=${savedSession.id}`, { scroll: false });
            }
        }

      } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'Failed to get a response from the AI.';
        let userFriendlyMessage = 'Failed to get a response from the AI. Please try again.';
        
        if (errorMessage.includes('overloaded')) {
            userFriendlyMessage = 'The AI model is currently busy. Please try again in a few moments.';
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
