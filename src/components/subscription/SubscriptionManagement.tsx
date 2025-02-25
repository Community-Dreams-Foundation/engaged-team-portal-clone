
import { useState, useEffect } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Subscription {
  subscriptionID: string;
  status: string;
  planType: string;
  createdAt: { toDate: () => Date };
  dueDate: string;
  price: number;
}

export function SubscriptionManagement() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) return;

      try {
        const subscriptionDoc = await getDoc(doc(db, 'subscriptions', currentUser.uid));
        if (subscriptionDoc.exists()) {
          setSubscription(subscriptionDoc.data() as Subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subscription details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser]);

  const handleCancelSubscription = async () => {
    if (!currentUser || !subscription) return;

    setCancelling(true);
    try {
      // Note: This would typically call a PayPal API endpoint to cancel the subscription
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the current billing period."
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription"
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">No Active Subscription</h2>
        <p className="text-muted-foreground">You don't have an active subscription.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Subscription Details</h2>
      
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
                subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                subscription.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
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
    </Card>
  );
}
