
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SubscriptionDetailsProps {
  subscription: {
    planType: string;
    status: string;
    createdAt: { toDate: () => Date };
    dueDate: string;
    price: number;
  };
  cancelling: boolean;
  handleCancelSubscription: () => Promise<void>;
  getStatusBadgeColor: (status: string) => string;
}

export function SubscriptionDetails({
  subscription,
  cancelling,
  handleCancelSubscription,
  getStatusBadgeColor
}: SubscriptionDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Current Subscription</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium capitalize">{subscription.planType}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getStatusBadgeColor(subscription.status)
              }`}>
                {subscription.status.toLowerCase()}
              </span>
            </TableCell>
            <TableCell>{format(subscription.createdAt.toDate(), 'MMM d, yyyy')}</TableCell>
            <TableCell>{format(new Date(subscription.dueDate), 'MMM d, yyyy')}</TableCell>
            <TableCell>${subscription.price}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <h4 className="text-sm font-medium text-blue-800 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Subscription Benefits
        </h4>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>Access to all premium features</li>
          <li>Priority customer support</li>
          <li>Advanced leadership training modules</li>
          <li>Unlimited career guidance resources</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="destructive"
          onClick={handleCancelSubscription}
          disabled={subscription.status !== 'ACTIVE' || cancelling}
        >
          {cancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            'Cancel Subscription'
          )}
        </Button>
      </div>
    </div>
  );
}
