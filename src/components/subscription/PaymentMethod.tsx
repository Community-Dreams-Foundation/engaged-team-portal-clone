
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentMethodProps {
  dueDate: string;
}

export function PaymentMethod({ dueDate }: PaymentMethodProps) {
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
      
      <Button variant="outline">Update Payment Method</Button>
    </div>
  );
}
