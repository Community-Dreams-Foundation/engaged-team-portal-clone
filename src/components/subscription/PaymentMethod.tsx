
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodProps {
  dueDate: string;
}

export function PaymentMethod({ dueDate }: PaymentMethodProps) {
  const { toast } = useToast();
  
  const handleUpdatePayment = () => {
    toast({
      title: "Update payment method",
      description: "This feature is not implemented yet.",
      variant: "default",
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
      
      <div className="border rounded-lg p-4 mb-4 flex items-start space-x-4">
        <CreditCard className="h-10 w-10 text-blue-500" />
        <div>
          <p className="font-medium">PayPal</p>
          <p className="text-sm text-muted-foreground">Connected to your PayPal account</p>
          <p className="text-sm mt-1">Next charge on {format(new Date(dueDate), 'MMM d, yyyy')}</p>
        </div>
      </div>
      
      <Button variant="outline" onClick={handleUpdatePayment}>Update Payment Method</Button>
    </div>
  );
}
