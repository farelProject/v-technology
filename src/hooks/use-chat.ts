
'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { chatWithSearch } from '@/ai/flows/chat-with-search';
import { generateImage } from '@/ai/flows/generate-image';
import { chat } from '@/ai/flows/chat';
import { getYoutubeAudio } from '@/ai/flows/get-youtube-audio';
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
      // If user is logged in, try to load the specified chat or create a new one for them.
      if (user) {
        const sessionId = chatId || new Date().getTime().toString();
        let loadedSession = chatId ? await getChatSession(user.id, chatId) : null;
        
        if (!loadedSession) {
            loadedSession = {
                id: sessionId,
                userId: user.id,
                title: '',
                timestamp: new Date().toISOString(),
                messages: [],
            };
        }
        
        setSession(loadedSession);
        setMessages(loadedSession.messages);

      } else { // If user is a guest
        // If a chatId is in the URL, clear it because guests can't access saved chats.
        if (chatId) {
            router.replace('/chat');
        }
        // Create a temporary in-memory session for the guest.
        const guestSession = await createNewChatSession('guest');
        setSession(guestSession);
        setMessages(guestSession.messages);
      }
    };

    loadSession();
  }, [chatId, user, router, toast]);


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
    if ((!input.trim() && !fileDataUri) || !session) return;

    // Check for chat limit first
    if (chatLimit && chatLimit.count >= chatLimit.limit) {
      toast({
            title: 'Chat Limit Reached',
            description: user ? 'Your daily limit will reset in 24 hours.' : 'Please log in to continue chatting.',
            variant: 'destructive',
        });
      return;
    }
    
    // Check for .play command
    const isPlayCommand = mode === 'chat' && input.trim().startsWith('.play ');

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
            // This can't be null for guests, but we check to be safe
            if (chatLimit) {
                newLimit = { count: chatLimit.count + 1, limit: chatLimit.limit };
                updateChatLimit({ count: newLimit.count });
            }
        }

        if (!newLimit || newLimit.count > newLimit.limit) {
             setMessages(currentMessages); // Revert to messages before loading indicator
             toast({
                title: 'Chat Limit Reached',
                description: user ? 'Your daily limit will reset in 24 hours.' : 'Please log in to continue chatting.',
                variant: 'destructive',
             });
             return;
        }

        // Show warning if limit is low
        const remainingChats = newLimit.limit - newLimit.count;
        if (newLimit.limit > 0 && remainingChats <= 2 && remainingChats > 0) {
            toast({
                title: 'Limit Warning',
                description: `You have ${remainingChats} messages left.`
            });
        }

        const { aiStyle, aiModel } = settings;
        const systemInstruction = `AI Style: ${aiStyle}, AI Model: ${aiModel}.`;
        const queryWithInstruction = `${systemInstruction}\n\nQuery: ${input}`;
        let assistantResponsePayload: Omit<Message, 'id' | 'role' | 'userId'>;

        if (isPlayCommand) {
            const query = input.trim().substring(6);
            const result = await getYoutubeAudio({ query });
            if (result.success) {
                assistantResponsePayload = {
                    content: `Here is the audio for "${result.title}"`,
                    type: 'audio',
                    image_url: result.imageUrl,
                    audio_url: result.audioUrl,
                    audio_title: result.title,
                }
            } else {
                assistantResponsePayload = {
                    content: result.message || 'Could not retrieve audio.',
                    type: 'text'
                }
            }
        } else if (mode === 'chat') {
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
        
        // Only save session if the user is logged in
        if (user) {
          const savedSession = await handleSaveSession(finalMessages, session);
          if (savedSession) {
              setSession(savedSession);
              // If this was a new chat, update URL to include the new session ID
              if (!chatId) {
                  router.replace(`/chat?id=${savedSession.id}`, { scroll: false });
              }
          }
        }

      } catch (error: any) {
        console.error(error);
        let userFriendlyMessage = 'Failed to get a response from the AI. Please try again.';
        
        if (error.message?.includes('overloaded')) {
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
