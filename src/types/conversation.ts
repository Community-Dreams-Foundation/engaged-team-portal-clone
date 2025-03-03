
export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages: ThreadMessage[];
  category?: string;
}

export interface ThreadMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}
