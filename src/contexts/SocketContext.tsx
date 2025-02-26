
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface SocketContextType {
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!currentUser) return;

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

    socketInstance.on('error', (error) => {
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

