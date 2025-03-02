
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionDetails } from "@/components/subscription/SubscriptionDetails";
import { BillingHistory } from "@/components/subscription/BillingHistory";
import { PaymentMethod } from "@/components/subscription/PaymentMethod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Clock, Receipt } from "lucide-react";

// Mock data for testing
const mockSubscriptionData = {
  plan: "Professional",
  status: "active",
  renewalDate: new Date().setDate(new Date().getDate() + 30),
  price: 49.99,
  features: [
    "Unlimited tasks",
    "5 AI agents",
    "Advanced analytics",
    "Priority support"
  ]
};

const mockPaymentMethods = [
  {
    id: "pm_1",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2024,
    isDefault: true
  },
  {
    id: "pm_2",
    brand: "mastercard",
    last4: "5555",
    expiryMonth: 10,
    expiryYear: 2025,
    isDefault: false
  }
];

const mockBillingHistory = [
  {
    id: "pay_1",
    amount: 49.99,
    status: "succeeded",
    date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    description: "Professional Plan - Monthly"
  },
  {
    id: "pay_2",
    amount: 49.99,
    status: "succeeded",
    date: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    description: "Professional Plan - Monthly"
  }
];

export const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState(mockSubscriptionData);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [billingHistory, setBillingHistory] = useState(mockBillingHistory);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription");

  // This would normally fetch data from an API
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscription(mockSubscriptionData);
      setPaymentMethods(mockPaymentMethods);
      setBillingHistory(mockBillingHistory);
      setLoading(false);
    }, 500);
  }, []);

  const handleSetDefaultPaymentMethod = (id: string) => {
    // Update payment methods
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully."
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription cancellation",
      description: "Please contact support to cancel your subscription.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Billing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          <SubscriptionDetails
            subscription={subscription}
            loading={loading}
            onCancelSubscription={handleCancelSubscription}
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
