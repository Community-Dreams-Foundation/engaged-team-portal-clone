
import { toast } from '@/components/ui/use-toast';
import { AccountApi } from '@/api/gateway';
import type { Session } from '@/types/auth';

export const useSessionManagement = (userId: string | undefined) => {
  const getActiveSessions = async (): Promise<Session[]> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    try {
      return await AccountApi.fetchSessions(userId);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast({
        variant: "destructive",
        title: "Error fetching sessions",
        description: "Could not retrieve your active sessions"
      });
      return [];
    }
  };

  const terminateSession = async (sessionId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    try {
      await AccountApi.terminateSession(sessionId);
      toast({
        title: "Session terminated",
        description: "The selected session has been logged out"
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        variant: "destructive",
        title: "Error terminating session",
        description: "Could not terminate the selected session"
      });
      throw error;
    }
  };

  const terminateAllSessions = async (excludeCurrentSession: boolean = true): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    try {
      await AccountApi.terminateAllSessions(excludeCurrentSession);
      toast({
        title: "All sessions terminated",
        description: excludeCurrentSession 
          ? "All other sessions have been logged out" 
          : "All sessions including current have been logged out"
      });
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toast({
        variant: "destructive",
        title: "Error terminating sessions",
        description: "Could not terminate all sessions"
      });
      throw error;
    }
  };

  return {
    getActiveSessions,
    terminateSession,
    terminateAllSessions
  };
};
