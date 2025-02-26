
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  FileText,
  Bell 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VisaStatus {
  type: string;
  expiryDate: number;
  remainingDays: number;
  documents: Array<{
    name: string;
    status: "valid" | "expiring" | "expired";
    expiryDate?: number;
  }>;
  nextSteps: Array<{
    id: string;
    description: string;
    deadline: number;
    completed: boolean;
  }>;
}

interface VisaStatusTrackerProps {
  status: VisaStatus;
  onSetReminder: (deadline: number) => void;
}

export function VisaStatusTracker({ status, onSetReminder }: VisaStatusTrackerProps) {
  const { toast } = useToast()

  const getStatusColor = (status: "valid" | "expiring" | "expired") => {
    switch (status) {
      case "valid":
        return "text-green-500 bg-green-500/10";
      case "expiring":
        return "text-yellow-500 bg-yellow-500/10";
      case "expired":
        return "text-red-500 bg-red-500/10";
    }
  };

  const handleSetReminder = (deadline: number) => {
    onSetReminder(deadline);
    toast({
      title: "Reminder Set",
      description: "You'll be notified before the deadline.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Visa Status Tracker</span>
          </div>
          <Badge 
            variant="secondary"
            className={getStatusColor(
              status.remainingDays < 30 ? "expiring" : 
              status.remainingDays < 0 ? "expired" : "valid"
            )}
          >
            {status.remainingDays} days remaining
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Current Status</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground">{status.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Expiry Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(status.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Required Documents</h4>
          <div className="space-y-2">
            {status.documents.map((doc) => (
              <div 
                key={doc.name}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <span className="text-sm">{doc.name}</span>
                <Badge className={getStatusColor(doc.status)}>
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Next Steps</h4>
          <div className="space-y-2">
            {status.nextSteps.map((step) => (
              <div 
                key={step.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={
                    new Date(step.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                      ? "h-4 w-4 text-red-500"
                      : "h-4 w-4 text-yellow-500"
                  } />
                  <div>
                    <p className="text-sm">{step.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(step.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSetReminder(step.deadline)}
                >
                  <Bell className="h-4 w-4" />
                  Remind
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
