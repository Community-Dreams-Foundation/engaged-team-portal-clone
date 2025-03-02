
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionDetails } from "./SubscriptionDetails";
import { PaymentMethod } from "./PaymentMethod";
import { BillingHistory } from "./BillingHistory";

type Subscription = {
  id: string;
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
};

type Payment = {
  id: string;
  amount: number;
  status: string;
  date: number;
  description: string;
};

type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

export const SubscriptionManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentCard[]>([]);
  const [billingHistory, setBillingHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Mock data for testing
        const mockSubscription: Subscription = {
          id: "sub_12345",
          plan: "Professional",
          status: "active",
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
          cancelAtPeriodEnd: false,
        };
        
        const mockPaymentMethods: PaymentCard[] = [
          {
            id: "pm_1234",
            brand: "visa",
            last4: "4242",
            expiryMonth: 12,
            expiryYear: 2024,
            isDefault: true,
          },
        ];
        
        const mockBillingHistory: Payment[] = [
          {
            id: "pay_1234",
            amount: 29.99,
            status: "succeeded",
            date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
            description: "Professional Plan - Monthly",
          },
          {
            id: "pay_5678",
            amount: 29.99,
            status: "succeeded",
            date: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
            description: "Professional Plan - Monthly",
          },
        ];

        setSubscription(mockSubscription);
        setPaymentMethods(mockPaymentMethods);
        setBillingHistory(mockBillingHistory);
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, [currentUser, toast]);

  const handleSetDefaultPaymentMethod = (id: string) => {
    toast({
      title: "Payment Method Updated",
      description: "Your default payment method has been updated.",
      variant: "success",
    });
    setPaymentMethods(prevMethods =>
      prevMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Subscription</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <SubscriptionDetails 
            subscription={subscription}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentMethod 
            paymentMethods={paymentMethods}
            loading={loading}
            onSetDefault={handleSetDefaultPaymentMethod}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <BillingHistory 
            billingHistory={billingHistory}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
