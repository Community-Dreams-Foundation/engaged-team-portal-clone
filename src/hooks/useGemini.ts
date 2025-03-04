
import { useState } from 'react';
import { AIApi } from '@/api/gateway';
import { toast } from '@/components/ui/use-toast';

interface ChatMessage {
  role: 'user' | 'system' | 'model';
  content: string;
}

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  /**
   * Generate content using Gemini model
   */
  const generateContent = async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AIApi.generateContent(prompt);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate content';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate an image using Gemini model
   */
  const generateImage = async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const imageUrl = await AIApi.generateImage(prompt);
      return imageUrl;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate image';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Chat with Gemini model
   */
  const chatWithGemini = async (message: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    const newMessage: ChatMessage = {
      role: 'user',
      content: message
    };
    
    // Update conversation state with user message
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    
    try {
      const { response } = await AIApi.chatWithGemini(updatedConversation);
      
      // Add model response to conversation
      const modelResponse: ChatMessage = {
        role: 'model',
        content: response
      };
      
      setConversation([...updatedConversation, modelResponse]);
      return response;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to chat with Gemini';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset the conversation history
   */
  const resetConversation = () => {
    setConversation([]);
  };

  /**
   * Add a system message to the conversation
   */
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      role: 'system',
      content
    };
    setConversation([systemMessage, ...conversation]);
  };

  return {
    isLoading,
    error,
    conversation,
    generateContent,
    generateImage,
    chatWithGemini,
    resetConversation,
    addSystemMessage
  };
}
