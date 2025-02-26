
export interface VisaStatus {
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

