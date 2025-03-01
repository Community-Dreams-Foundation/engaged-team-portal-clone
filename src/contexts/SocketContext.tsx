
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Mock socket implementation since we're disabling it
const mockSocket = {
  on: (event: string, callback: Function) => {
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  },
  emit: () => {},
  disconnect: () => {},
  auth: {}
};

interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated - but we're disabling real connection for now
    if (!currentUser) return;

    try {
      console.log('Socket functionality is temporarily disabled');
      
      // Use mock socket instead of real connection
      setSocket(mockSocket);
      setIsConnected(true);
      
      // No toast notification about connection since we're mocking
      
      return () => {
        console.log('Cleaning up socket connection...');
        // No real disconnect needed
      };
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setIsConnected(false);
    }
  }, [currentUser]);

  const sendMessage = (message: any) => {
    console.log('Socket functionality is disabled, message not sent:', message);
  };

  const value = {
    socket,
    isConnected,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
