
import { toast } from '@/components/ui/use-toast';
import { AccountApi } from '@/api/gateway';

export const exportUserData = async (userId: string): Promise<Blob> => {
  if (!userId) {
    throw new Error('User not authenticated');
  }
  try {
    const userData = await AccountApi.exportUserData(userId);
    // Convert the data to a JSON blob
    const jsonString = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    toast({
      title: "Data export ready",
      description: "Your data has been prepared for download"
    });
    
    return blob;
  } catch (error) {
    console.error('Error exporting user data:', error);
    toast({
      variant: "destructive",
      title: "Error exporting data",
      description: "Could not export your personal data"
    });
    throw error;
  }
};
