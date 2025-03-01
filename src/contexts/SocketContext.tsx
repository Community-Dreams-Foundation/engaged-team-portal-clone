
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Try to import socket.io-client, but provide a fallback if it fails
let Socket: any;
let io: any;

try {
  // Dynamic import for socket.io-client
  const socketModule = require('socket.io-client');
  Socket = socketModule.Socket;
  io = socketModule.io || socketModule.default;
} catch (error) {
  console.error('Error importing socket.io-client:', error);
  // Create a mock implementation if import fails
  io = (url: string) => {
    console.warn('Using mock socket implementation');
    return {
      on: (event: string, callback: Function) => {
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        }
      },
      emit: () => {},
      disconnect: () => {},
      auth: {}
    };
  };
}

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
    // Only connect if user is authenticated
    if (!currentUser) return;

    try {
      console.log('Initializing socket connection...');
      const socketInstance = io('http://localhost:3001', {
        auth: {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous'
        }
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        toast({
          title: "Connected to real-time server",
          description: "You'll receive live updates",
        });
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        toast({
          variant: "destructive",
          title: "Disconnected from server",
          description: "Trying to reconnect...",
        });
      });

      socketInstance.on('error', (error: any) => {
        console.error('Socket error:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to establish real-time connection",
        });
      });

      setSocket(socketInstance);

      return () => {
        console.log('Cleaning up socket connection...');
        socketInstance.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setIsConnected(false);
    }
  }, [currentUser]);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.emit('message', message);
    } else {
      console.error('Cannot send message: Socket not connected');
    }
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
