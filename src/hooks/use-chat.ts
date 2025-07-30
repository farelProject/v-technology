
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

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  };


  const handleSend = (mode: AiMode, input: string, fileDataUri?: string) => {
    if (!user) {
        toast({ title: "Please log in to chat.", variant: "destructive"});
        return;
    }
    if (!input.trim() && !fileDataUri) return;
    if (!session) return;

    const userMessageId = `${Date.now()}-${Math.random()}`;
    
    startTransition(async () => {
      // Optimistically add user message
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: input,
        isLoading: !!fileDataUri, // Set loading if there's a file
      };
      setMessages(prev => [...prev, userMessage]);

      let uploadedImageUrl: string | undefined = undefined;
      let fileForAi: string | undefined = fileDataUri;

      if (fileDataUri) {
        const uploadResult = await uploadImage(fileDataUri);
        if (uploadResult.success && uploadResult.url) {
          uploadedImageUrl = uploadResult.url;
          // Use the hosted URL for the AI, not the base64 data URI
          fileForAi = uploadResult.url;
          // Update the user message to show the uploaded image
          updateMessage(userMessageId, {
            isLoading: false,
            image_url: uploadedImageUrl,
          });
        } else {
          toast({
            title: 'Image Upload Failed',
            description: uploadResult.error || 'Could not upload your image. Please try again.',
            variant: 'destructive',
          });
          // Remove the optimistic message on failure
          setMessages(prev => prev.filter(msg => msg.id !== userMessageId));
          return;
        }
      }
        
      const loadingMessageId = `${Date.now()}`;
      // Add loading indicator for AI response
      setMessages(prev => [...prev, { id: loadingMessageId, role: 'assistant', content: '...' }]);
        
      try {
          const { aiStyle, aiModel } = settings;
          const systemInstruction = `Gaya AI: ${aiStyle}, Model AI: ${aiModel}.`;
          const queryWithInstruction = `${systemInstruction}\n\nPertanyaan: ${input}`;
          let assistantResponse: Message;
  
          if (mode === 'chat') {
             const result = await chat({ query: queryWithInstruction, file: fileForAi });
             assistantResponse = {
               content: result.response,
               type: 'text',
             };
          } else if (mode === 'search') {
            const result = await chatWithSearch({ query: queryWithInstruction, file: fileForAi });
            assistantResponse = {
              content: result.response,
              type: 'text',
              search_results: result.searchResults
            };
          } else if (mode === 'image') {
            const result = await generateImage({ prompt: input });
            assistantResponse = {
              content: `Here is the image you requested for: "${input}"`,
              type: 'image',
              image_url: result.imageUrl, // Use the direct data URI from the AI
            };
          } else {
              throw new Error(`Unknown mode: ${mode}`);
          }

          // Update the loading message with the actual response
          updateMessage(loadingMessageId, {
            ...assistantResponse,
            id: loadingMessageId, // Ensure ID remains the same
            role: 'assistant',
          });

          // Save the complete session
          const finalMessages = messages.map(msg => {
            if (msg.id === userMessageId) {
                return { ...userMessage, image_url: uploadedImageUrl, isLoading: false };
            }
            if(msg.id === loadingMessageId) {
                 return { ...msg, ...assistantResponse, id: loadingMessageId, role: 'assistant' };
            }
            return msg;
          });
          
          // Get the latest state of messages before saving
          setMessages(currentMessages => {
            const savedSessionPromise = handleSaveSession(currentMessages, session);
            savedSessionPromise.then(savedSession => {
                if (savedSession) {
                    setSession(savedSession);
                    if (!chatId) {
                        router.replace(`/?id=${savedSession.id}`, { scroll: false });
                    }
                }
            })
            return currentMessages;
          });


      } catch (error: any) {
          console.error(error);
          updateMessage(loadingMessageId, { content: 'Gagal mendapatkan respons dari AI. Silakan coba lagi.', id: loadingMessageId, role: 'assistant' });
          toast({
            title: 'Error',
            description: error.message || 'Failed to get response from AI. Please try again.',
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
