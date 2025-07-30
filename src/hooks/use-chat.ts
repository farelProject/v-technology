
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
import { uploadImage } from '@/lib/image-upload-service';

export function useChat(chatId: string | null) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();
  const router = useRouter();
  
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load chat session
  useEffect(() => {
    if (!user) {
        setMessages([]); // Clear messages if user logs out
        setSession(null);
        return;
    };
    
    const loadSession = async () => {
        if (chatId) {
          getChatSession(user.id, chatId).then((loadedSession) => {
            if (loadedSession) {
              setSession(loadedSession);
              setMessages(loadedSession.messages);
            } else {
              // If chat ID is invalid, redirect to new chat
              toast({ title: "Chat not found", variant: "destructive" });
              router.push('/');
            }
          });
        } else {
          // If it's a new chat, create a new session object
           const newSession = await createNewChatSession(user.id);
           setSession(newSession);
           setMessages(newSession.messages); // messages will be []
        }
    };
    
    loadSession();

  }, [chatId, user, router, toast]);
  
  const handleSaveSession = useCallback(async (updatedMessages: Message[], currentSession: ChatSession) => {
      if (!user) return null;
      
      let sessionToSave = { ...currentSession, messages: updatedMessages };

      // Generate a title for new chats from the first user message
      if (updatedMessages.length > 0 && !sessionToSave.title) {
        const firstUserMessage = updatedMessages.find(m => m.role === 'user');
        if (firstUserMessage) {
            sessionToSave.title = firstUserMessage.content.substring(0, 50) + '...';
        }
      }
      
      await saveChatSession(user.id, sessionToSave);
      return sessionToSave;

  }, [user]);


  const handleSend = (mode: AiMode, input: string, fileDataUri?: string) => {
    if (!user) {
        toast({ title: "Please log in to chat.", variant: "destructive"});
        return;
    }
    if (!input.trim() && !fileDataUri) return;
    if (!session) return;

    // Ensure user message and loading message have unique IDs
    const timestamp = Date.now();
    const userMessageId = `${timestamp}-${Math.random()}`;
    const loadingMessageId = `${timestamp + 1}`;
    
    startTransition(async () => {
        try {
            let uploadedImageUrl: string | undefined = undefined;
            if (fileDataUri) {
                // Upload image to ImgBB first
                const uploadResult = await uploadImage(fileDataUri);
                if (uploadResult.success) {
                    uploadedImageUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Failed to upload image');
                }
            }

            const userMessage: Message = {
              id: userMessageId,
              role: 'user',
              content: input,
              image_url: uploadedImageUrl, // Use the new ImgBB URL
            };

            const updatedMessages = [...messages, userMessage];
            setMessages(updatedMessages);

            // Add loading indicator
            setMessages(prev => [...prev, { id: loadingMessageId, role: 'assistant', content: '...' }]);
            
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
              // Upload the generated image as well
              const genImgUploadResult = await uploadImage(result.imageUrl);
              if (!genImgUploadResult.success) {
                  throw new Error('Failed to save generated image.');
              }

              assistantMessage = {
                id: loadingMessageId,
                role: 'assistant',
                content: `Here is the image you requested for: "${input}"`,
                type: 'image',
                image_url: genImgUploadResult.url, // Save the ImgBB URL
              };
            } else {
                throw new Error(`Unknown mode: ${mode}`);
            }

            // Replace loading message with the final assistant message
            const finalMessages = [...updatedMessages, assistantMessage];

            const savedSession = await handleSaveSession(finalMessages, session);

            if (savedSession) {
                setSession(savedSession);
                setMessages(savedSession.messages);
            }

            // If this was a new chat, redirect to the new chat's URL
            if (!chatId) {
                router.replace(`/?id=${session.id}`, { scroll: false });
            }

        } catch (error: any) {
            console.error(error);
            toast({
              title: 'Error',
              description: error.message || 'Failed to get response from AI. Please try again.',
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
