
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Check, 
  Clock,
  AlertCircle
} from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  date: number;
  description: string;
};

interface BillingHistoryProps {
  billingHistory: Payment[];
  loading: boolean;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  billingHistory,
  loading,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Check className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg border">
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-40 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
      </div>
    );
  }

  if (billingHistory.length === 0) {
    return (
      <div className="p-6 rounded-lg border text-center">
        <h3 className="text-lg font-medium mb-2">No Billing History</h3>
        <p className="text-muted-foreground">
          Your payment history will appear here once you've made a payment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Billing History</h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billingHistory.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {new Date(payment.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{payment.description}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getStatusIcon(payment.status)}
                  <span className="ml-2 capitalize">{payment.status}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
