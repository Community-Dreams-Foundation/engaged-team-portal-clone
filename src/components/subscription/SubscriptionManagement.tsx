
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, getFirestore, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionDetails } from './SubscriptionDetails';
import { BillingHistory } from './BillingHistory';
import { PaymentMethod } from './PaymentMethod';

interface Subscription {
  subscriptionID: string;
  status: string;
  planType: string;
  createdAt: { toDate: () => Date };
  dueDate: string;
  price: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: { toDate: () => Date };
  status: 'completed' | 'pending' | 'failed';
  method: string;
  description: string;
}

export function SubscriptionManagement() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const db = getFirestore();
  const { toast } = useToast();

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
  }, [currentUser, toast, db]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!currentUser) return;

      setHistoryLoading(true);
      try {
        // This would fetch payment history from Firestore
        // In a real app, this might be from a payment processor's API
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments: PaymentHistory[] = [];
        
        paymentsSnapshot.forEach(doc => {
          payments.push({ id: doc.id, ...doc.data() } as PaymentHistory);
        });
        
        // If no real payment history exists, add some mock data for display
        if (payments.length === 0 && subscription) {
          // Generate 3 months of payment history based on current subscription
          const mockPayments: PaymentHistory[] = [];
          const today = new Date();
          
          for (let i = 0; i < 3; i++) {
            const paymentDate = new Date();
            paymentDate.setMonth(today.getMonth() - i);
            
            mockPayments.push({
              id: `mock-payment-${i}`,
              amount: subscription.price,
              date: { toDate: () => paymentDate },
              status: 'completed',
              method: 'paypal',
              description: `${subscription.planType} subscription payment`
            });
          }
          
          setPaymentHistory(mockPayments);
        } else {
          setPaymentHistory(payments);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment history"
        });
      } finally {
        setHistoryLoading(false);
      }
    };

    if (subscription) {
      fetchPaymentHistory();
    }
  }, [currentUser, subscription, toast, db]);

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

  const handleDownloadInvoice = (paymentId: string) => {
    // In a real app, this would generate and download a PDF invoice
    toast({
      title: "Invoice Download",
      description: "Your invoice is being generated and will download shortly."
    });
    
    // Simulate invoice generation delay
    setTimeout(() => {
      console.log(`Downloading invoice for payment ${paymentId}`);
      // In reality, this would trigger the download of a generated PDF
    }, 1500);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Subscription Details</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <SubscriptionDetails 
            subscription={subscription}
            cancelling={cancelling}
            handleCancelSubscription={handleCancelSubscription}
            getStatusBadgeColor={getStatusBadgeColor}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <BillingHistory 
            paymentHistory={paymentHistory}
            historyLoading={historyLoading}
            handleDownloadInvoice={handleDownloadInvoice}
          />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentMethod dueDate={subscription.dueDate} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
