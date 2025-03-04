
export interface GeminiGenerationRequest {
  prompt: string;
}

export interface GeminiImageGenerationRequest {
  prompt: string;
}

export interface GeminiChatMessage {
  role: 'user' | 'system' | 'model';
  content: string;
}

export interface GeminiChatRequest {
  messages: GeminiChatMessage[];
}

export interface GeminiChatResponse {
  response: string;
  conversationId?: string;
}

export interface GeminiStreamChatRequest extends GeminiChatRequest {
  callback: (chunk: string) => void;
}
