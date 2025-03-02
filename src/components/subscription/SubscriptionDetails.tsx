
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";

interface Subscription {
  plan: string;
  status: string;
  renewalDate: number;
  price: number;
  features: string[];
}

interface SubscriptionDetailsProps {
  subscription: Subscription;
  loading: boolean;
  onCancelSubscription: () => void;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  loading,
  onCancelSubscription,
}) => {
  if (loading) {
    return (
      <div className="p-6 rounded-lg border">
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-20 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-12 w-1/2 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="font-medium">{subscription.plan}</p>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {subscription.status === "active" ? "Active" : "Inactive"}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Renewal Date</p>
            <p className="font-medium">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Cost</p>
            <p className="font-medium">${subscription.price.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Plan Features</h4>
          <ul className="space-y-2">
            {subscription.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4 border-t">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Subscription Management</h4>
              <p className="text-sm text-amber-700">
                To upgrade, downgrade or cancel your subscription, please contact our support team.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancelSubscription}>
            Cancel Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};
