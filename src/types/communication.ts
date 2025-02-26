
export interface MessageFormat {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  quote?: boolean;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  threadId?: string;
  isRead: boolean;
  format?: MessageFormat;
}
