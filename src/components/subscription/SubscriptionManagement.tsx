
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionDetails } from "./SubscriptionDetails";
import { BillingHistory } from "./BillingHistory";
import { PaymentMethod } from "./PaymentMethod";

export function SubscriptionManagement() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  // Fetch subscription data
  useEffect(() => {
    if (!currentUser) return;

    const fetchSubscription = async () => {
      try {
        // Mock subscription data for demonstration
        const mockSubscription = {
          planType: "professional",
          status: "ACTIVE",
          createdAt: { toDate: () => new Date(2023, 5, 15) },
          dueDate: new Date(2023, 11, 15).toISOString(),
          price: 29.99
        };
        
        setSubscription(mockSubscription);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription details",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser, toast, db]);

  // Fetch payment history
  useEffect(() => {
    if (!currentUser) return;

    const fetchPaymentHistory = async () => {
      try {
        // Mock payment history data
        const mockPaymentHistory = [
          {
            id: "payment1",
            date: { toDate: () => new Date(2023, 10, 15) },
            amount: 29.99,
            status: "completed",
            method: "PayPal",
            description: "Professional Plan - Monthly"
          },
          {
            id: "payment2",
            date: { toDate: () => new Date(2023, 9, 15) },
            amount: 29.99,
            status: "completed",
            method: "PayPal",
            description: "Professional Plan - Monthly"
          },
          {
            id: "payment3",
            date: { toDate: () => new Date(2023, 8, 15) },
            amount: 29.99,
            status: "completed",
            method: "PayPal",
            description: "Professional Plan - Monthly"
          }
        ];
        
        setPaymentHistory(mockPaymentHistory);
        setHistoryLoading(false);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        toast({
          title: "Error",
          description: "Failed to load billing history",
          variant: "destructive",
        });
        setHistoryLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [currentUser, toast, db]);

  const handleCancelSubscription = async () => {
    if (!currentUser || !subscription) return;
    
    setCancelling(true);
    
    try {
      // Mock cancellation API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the subscription status
      setSubscription({
        ...subscription,
        status: "CANCELED"
      });
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been successfully canceled.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = (paymentId: string) => {
    toast({
      title: "Download started",
      description: `Invoice ${paymentId} is being prepared for download.`,
      variant: "default",
    });
    
    // Mock download functionality
    setTimeout(() => {
      console.log(`Downloading invoice: ${paymentId}`);
    }, 1500);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {subscription && (
        <SubscriptionDetails 
          subscription={subscription}
          cancelling={cancelling}
          handleCancelSubscription={handleCancelSubscription}
          getStatusBadgeColor={getStatusBadgeColor}
        />
      )}
      
      <div className="my-8 border-t pt-8">
        <PaymentMethod 
          dueDate={subscription?.dueDate || new Date().toISOString()}
        />
      </div>
      
      <div className="mt-8">
        <BillingHistory 
          paymentHistory={paymentHistory}
          historyLoading={historyLoading}
          handleDownloadInvoice={handleDownloadInvoice}
        />
      </div>
    </div>
  );
}
