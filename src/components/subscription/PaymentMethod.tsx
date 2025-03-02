
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Check, 
  Plus,
  Trash2
} from "lucide-react";

type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

interface PaymentMethodProps {
  paymentMethods: PaymentCard[];
  loading: boolean;
  onSetDefault: (id: string) => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethods,
  loading,
  onSetDefault
}) => {
  if (loading) {
    return (
      <div className="p-6 rounded-lg border">
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-20 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
      
      {paymentMethods.length === 0 ? (
        <div className="text-center py-6">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No payment methods found</p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={`p-4 border rounded-lg flex justify-between items-center ${
                method.isDefault ? "border-primary" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  <CreditCard className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-medium capitalize">
                    {method.brand} •••• {method.last4}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {method.isDefault ? (
                  <div className="flex items-center text-sm font-medium text-primary">
                    <Check className="mr-1 h-4 w-4" />
                    Default
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetDefault(method.id)}
                  >
                    Set as default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      )}
    </div>
  );
};
