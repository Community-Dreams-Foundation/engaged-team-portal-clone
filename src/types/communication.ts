
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
  likes?: number;
  replies?: Message[];
  tags?: string[];
  mentionedUsers?: string[];
  attachments?: {
    type: 'image' | 'link' | 'file';
    url: string;
    name: string;
  }[];
  groupId?: string;
}

export interface Thread {
  id: string;
  title?: string;
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  participantIds: string[];
  tags?: string[];
  isAnnouncement?: boolean;
  groupId?: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  lastActive: string;
  badges?: string[];
  connections: string[];
  expertise: string[];
  bio?: string;
  avatarUrl?: string;
}

export interface NetworkConnection {
  userId: string;
  connectionId: string;
  status: 'pending' | 'connected' | 'blocked';
  createdAt: string;
  lastInteraction?: string;
  mutualConnections?: number;
  sharedGroups?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  memberIds: string[];
  moderatorIds: string[];
  isPrivate: boolean;
  tags?: string[];
}
