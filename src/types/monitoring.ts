
export type AlertType = 
  | "overdue" 
  | "approaching_deadline" 
  | "duration_exceeded" 
  | "blocked_dependency"
  | "performance_anomaly";

export interface Alert {
  id: string;
  type: AlertType;
  taskId: string;
  message: string;
  details?: string;
  timestamp: number;
  read: boolean;
}

export interface MonitoringStats {
  taskCompletionRate: number;
  onTimeCompletion: number;
  averageTaskDuration: number;
  blockedTasks: number;
}
