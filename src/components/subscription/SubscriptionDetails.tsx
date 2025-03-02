
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  CreditCard, 
  RefreshCcw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Subscription = {
  id: string;
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
};

interface SubscriptionDetailsProps {
  subscription: Subscription | null;
  loading: boolean;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  loading
}) => {
  const { toast } = useToast();

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Canceled",
      description: "Your subscription will end at the current billing period.",
      variant: "success",
    });
  };

  const handleResumeSubscription = () => {
    toast({
      title: "Subscription Resumed",
      description: "Your subscription will continue after the current billing period.",
      variant: "success",
    });
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg border">
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-6"></div>
        <div className="h-10 w-1/3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6 rounded-lg border text-center">
        <h3 className="text-lg font-medium">No Active Subscription</h3>
        <p className="text-muted-foreground mt-2">
          You don't have an active subscription. Subscribe to access premium features.
        </p>
        <Button className="mt-4">
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
      </div>
    );
  }

  const nextBillingDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();
  
  const getStatusIcon = () => {
    switch (subscription.status) {
      case "active":
        return <Check className="text-green-500" />;
      case "past_due":
        return <AlertTriangle className="text-amber-500" />;
      case "canceled":
        return <AlertTriangle className="text-red-500" />;
      default:
        return <Clock className="text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (subscription.status) {
      case "active":
        return subscription.cancelAtPeriodEnd 
          ? "Cancels at end of billing period" 
          : "Active";
      case "past_due":
        return "Past due - Please update payment method";
      case "canceled":
        return "Canceled";
      case "trialing":
        return "Trial period";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-6 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{subscription.plan} Plan</h3>
          <div className="flex items-center mt-1 space-x-1.5">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Next billing date
          </div>
          <div className="font-medium">{nextBillingDate}</div>
        </div>
      </div>
      
      <div className="mt-6">
        {subscription.cancelAtPeriodEnd ? (
          <Button onClick={handleResumeSubscription} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Resume Subscription
          </Button>
        ) : (
          <Button onClick={handleCancelSubscription} variant="outline">
            Cancel Subscription
          </Button>
        )}
      </div>
    </div>
  );
};
