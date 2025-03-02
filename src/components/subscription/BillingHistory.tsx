
import { format } from 'date-fns';
import { Loader2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaymentHistory {
  id: string;
  amount: number;
  date: { toDate: () => Date };
  status: 'completed' | 'pending' | 'failed';
  method: string;
  description: string;
}

interface BillingHistoryProps {
  paymentHistory: PaymentHistory[];
  historyLoading: boolean;
  handleDownloadInvoice: (paymentId: string) => void;
}

export function BillingHistory({
  paymentHistory,
  historyLoading,
  handleDownloadInvoice
}: BillingHistoryProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Billing History</h3>
      
      {historyLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : paymentHistory.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(payment.date.toDate(), 'MMM d, yyyy')}</TableCell>
                <TableCell>{payment.description}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>
                  <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleDownloadInvoice(payment.id)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download Invoice</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground py-4">No billing history available.</p>
      )}
    </div>
  );
}
