
import { toast } from '@/components/ui/use-toast';
import { AccountApi } from '@/api/gateway';
import type { ActivityLogEntry } from '@/types/auth';

export const useAccountActivity = (userId: string | undefined) => {
  const getAccountActivity = async (limit: number = 20): Promise<ActivityLogEntry[]> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    try {
      return await AccountApi.fetchActivityLog(userId, limit);
    } catch (error) {
      console.error('Error fetching account activity:', error);
      toast({
        variant: "destructive",
        title: "Error fetching activity",
        description: "Could not retrieve your account activity"
      });
      return [];
    }
  };

  return {
    getAccountActivity
  };
};
