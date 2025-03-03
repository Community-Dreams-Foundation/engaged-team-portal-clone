
import { getDatabase, ref, onValue, off, set, push } from "firebase/database";
import { Task } from "@/types/task";
import { toast } from "@/hooks/use-toast";

interface MonitoringAlert {
  id: string;
  taskId: string;
  taskTitle: string;
  type: "overdue" | "approaching_deadline" | "duration_exceeded" | "dependency_blocked" | "high_priority" | "performance_anomaly";
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: number;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceThreshold {
  taskDurationWarningPercent: number; // Percentage of estimated time that triggers warning (e.g., 80%)
  taskDurationCriticalPercent: number; // Percentage of estimated time that triggers critical alert (e.g., 100%)
  deadlineWarningHours: number; // Hours before deadline to trigger warning
  inactivityWarningMinutes: number; // Minutes of inactivity on in-progress tasks
  anomalyDeviationPercent: number; // Percentage deviation that's considered an anomaly
}

// Default thresholds - can be customized per user
const defaultThresholds: PerformanceThreshold = {
  taskDurationWarningPercent: 80,
  taskDurationCriticalPercent: 100,
  deadlineWarningHours: 24,
  inactivityWarningMinutes: 120, // 2 hours
  anomalyDeviationPercent: 25
};

// In-memory cache to prevent duplicate alerts
const recentAlerts = new Map<string, number>();

/**
 * Start real-time monitoring for a user's tasks
 */
export const startRealTimeMonitoring = (userId: string, customThresholds?: Partial<PerformanceThreshold>) => {
  if (!userId) return;
  
  const thresholds = { ...defaultThresholds, ...customThresholds };
  const db = getDatabase();
  const tasksRef = ref(db, `users/${userId}/tasks`);
  
  // Start listening for task changes in real-time
  onValue(tasksRef, (snapshot) => {
    if (!snapshot.exists()) return;
    
    const tasks: Record<string, Task> = snapshot.val();
    const now = Date.now();
    
    // Process each task for potential alerts
    Object.values(tasks).forEach(task => {
      checkTaskForAlerts(userId, task, thresholds, now);
    });
    
    // Check for broader performance patterns
    checkPerformancePatterns(userId, Object.values(tasks), thresholds);
  });
  
  console.log("Real-time performance monitoring started for user:", userId);
};

/**
 * Stop real-time monitoring for a user
 */
export const stopRealTimeMonitoring = (userId: string) => {
  if (!userId) return;
  
  const db = getDatabase();
  const tasksRef = ref(db, `users/${userId}/tasks`);
  
  // Remove the listener
  off(tasksRef);
  
  console.log("Real-time performance monitoring stopped for user:", userId);
};

/**
 * Check a single task for potential alerts
 */
const checkTaskForAlerts = (
  userId: string,
  task: Task,
  thresholds: PerformanceThreshold,
  now: number
) => {
  // Skip completed tasks
  if (task.status === "completed") return;
  
  // Check for approaching deadline
  if (task.dueDate && task.status !== "completed") {
    const hoursToDeadline = (task.dueDate - now) / (1000 * 60 * 60);
    
    if (hoursToDeadline < 0) {
      // Task is overdue
      createAlert(userId, {
        taskId: task.id,
        taskTitle: task.title,
        type: "overdue",
        message: `Task "${task.title}" is overdue by ${Math.abs(Math.round(hoursToDeadline))} hours.`,
        severity: "critical",
        metadata: { hoursOverdue: Math.abs(Math.round(hoursToDeadline)) }
      });
    } else if (hoursToDeadline <= thresholds.deadlineWarningHours) {
      // Task is approaching deadline
      createAlert(userId, {
        taskId: task.id,
        taskTitle: task.title,
        type: "approaching_deadline",
        message: `Task "${task.title}" is due in ${Math.round(hoursToDeadline)} hours.`,
        severity: "warning",
        metadata: { hoursRemaining: Math.round(hoursToDeadline) }
      });
    }
  }
  
  // Check for tasks exceeding estimated duration
  if (task.isTimerRunning && task.startTime && task.estimatedDuration) {
    const elapsedTime = task.totalElapsedTime || (now - task.startTime);
    const estimatedTimeMs = task.estimatedDuration * 60 * 1000;
    const percentComplete = (elapsedTime / estimatedTimeMs) * 100;
    
    if (percentComplete >= thresholds.taskDurationCriticalPercent) {
      createAlert(userId, {
        taskId: task.id,
        taskTitle: task.title,
        type: "duration_exceeded",
        message: `Task "${task.title}" has exceeded its estimated duration by ${Math.round(percentComplete - 100)}%.`,
        severity: "critical",
        metadata: { percentExceeded: Math.round(percentComplete - 100) }
      });
    } else if (percentComplete >= thresholds.taskDurationWarningPercent) {
      createAlert(userId, {
        taskId: task.id,
        taskTitle: task.title,
        type: "duration_exceeded",
        message: `Task "${task.title}" is at ${Math.round(percentComplete)}% of its estimated duration.`,
        severity: "warning",
        metadata: { percentComplete: Math.round(percentComplete) }
      });
    }
  }
  
  // Check for in-progress tasks with inactivity
  if (task.status === "in-progress" && !task.isTimerRunning && task.updatedAt) {
    const minutesSinceUpdate = (now - task.updatedAt) / (1000 * 60);
    
    if (minutesSinceUpdate >= thresholds.inactivityWarningMinutes) {
      createAlert(userId, {
        taskId: task.id,
        taskTitle: task.title,
        type: "performance_anomaly",
        message: `Task "${task.title}" has been inactive for ${Math.round(minutesSinceUpdate)} minutes.`,
        severity: "info",
        metadata: { minutesInactive: Math.round(minutesSinceUpdate) }
      });
    }
  }
  
  // Check if high priority tasks are not being worked on
  if (task.priority === "high" && task.status === "todo") {
    createAlert(userId, {
      taskId: task.id,
      taskTitle: task.title,
      type: "high_priority",
      message: `High priority task "${task.title}" is not yet started.`,
      severity: "warning"
    });
  }
  
  // Check for blocked tasks due to dependencies
  if (task.status === "blocked" || (task.dependencies && task.dependencies.length > 0)) {
    createAlert(userId, {
      taskId: task.id,
      taskTitle: task.title,
      type: "dependency_blocked",
      message: `Task "${task.title}" is blocked by dependencies.`,
      severity: "info",
      metadata: { dependencies: task.dependencies }
    });
  }
};

/**
 * Check broader performance patterns across all tasks
 */
const checkPerformancePatterns = (
  userId: string,
  tasks: Task[],
  thresholds: PerformanceThreshold
) => {
  // Calculate average completion time for tasks
  const completedTasks = tasks.filter(t => t.status === "completed" && t.actualDuration);
  
  if (completedTasks.length > 0) {
    const avgActualDuration = completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasks.length;
    const avgEstimatedDuration = completedTasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0) / completedTasks.length;
    
    // Check for significant estimation deviation
    const deviationPercent = Math.abs((avgActualDuration - avgEstimatedDuration) / avgEstimatedDuration * 100);
    
    if (deviationPercent >= thresholds.anomalyDeviationPercent) {
      createAlert(userId, {
        taskId: "system",
        taskTitle: "Performance Pattern",
        type: "performance_anomaly",
        message: `Your task time estimates are off by ${Math.round(deviationPercent)}% on average.`,
        severity: "info",
        metadata: { 
          deviationPercent: Math.round(deviationPercent),
          avgActualDuration,
          avgEstimatedDuration,
          trend: avgActualDuration > avgEstimatedDuration ? "underestimated" : "overestimated"
        }
      });
    }
  }
  
  // Check for overdue tasks percentage
  const overdueTasksCount = tasks.filter(t => 
    t.status !== "completed" && t.dueDate && t.dueDate < Date.now()
  ).length;
  
  if (overdueTasksCount > 0) {
    const overduePercent = (overdueTasksCount / tasks.length) * 100;
    
    if (overduePercent >= 20) { // If 20% or more tasks are overdue
      createAlert(userId, {
        taskId: "system",
        taskTitle: "Performance Pattern",
        type: "performance_anomaly",
        message: `${overdueTasksCount} tasks (${Math.round(overduePercent)}%) are currently overdue.`,
        severity: overduePercent >= 40 ? "critical" : "warning",
        metadata: { 
          overduePercent: Math.round(overduePercent),
          overdueCount: overdueTasksCount,
          totalTasks: tasks.length
        }
      });
    }
  }
};

/**
 * Create a new alert for a user
 */
const createAlert = (userId: string, alertData: Omit<MonitoringAlert, "id" | "timestamp" | "acknowledged">) => {
  // Create a deduplication key
  const dedupeKey = `${userId}-${alertData.taskId}-${alertData.type}`;
  const now = Date.now();
  
  // Check if we've recently sent this alert (within the last hour)
  if (recentAlerts.has(dedupeKey)) {
    const lastAlertTime = recentAlerts.get(dedupeKey) || 0;
    if (now - lastAlertTime < 60 * 60 * 1000) {
      return; // Skip duplicate alert
    }
  }
  
  // Update the recent alerts cache
  recentAlerts.set(dedupeKey, now);
  
  // Clean up old cache entries
  for (const [key, timestamp] of recentAlerts.entries()) {
    if (now - timestamp > 6 * 60 * 60 * 1000) { // 6 hours
      recentAlerts.delete(key);
    }
  }
  
  // Create the alert
  const db = getDatabase();
  const alertsRef = ref(db, `users/${userId}/alerts`);
  const newAlertRef = push(alertsRef);
  
  if (!newAlertRef.key) return;
  
  const alert: MonitoringAlert = {
    id: newAlertRef.key,
    timestamp: now,
    acknowledged: false,
    ...alertData
  };
  
  // Save to Firebase
  set(newAlertRef, alert);
  
  // Show toast notification based on severity
  const toastVariant = alert.severity === "critical" ? "destructive" : 
                       alert.severity === "warning" ? "default" : "secondary";
  
  toast({
    title: getAlertTitle(alert.type),
    description: alert.message,
    variant: toastVariant,
  });
};

/**
 * Get a human-readable title for an alert type
 */
const getAlertTitle = (type: MonitoringAlert["type"]): string => {
  switch (type) {
    case "overdue":
      return "Task Overdue";
    case "approaching_deadline":
      return "Approaching Deadline";
    case "duration_exceeded":
      return "Duration Alert";
    case "dependency_blocked":
      return "Task Blocked";
    case "high_priority":
      return "High Priority Task";
    case "performance_anomaly":
      return "Performance Insight";
    default:
      return "Task Alert";
  }
};

/**
 * Mark an alert as acknowledged
 */
export const acknowledgeAlert = async (userId: string, alertId: string): Promise<void> => {
  const db = getDatabase();
  const alertRef = ref(db, `users/${userId}/alerts/${alertId}`);
  
  return set(alertRef, { acknowledged: true });
};

/**
 * Clear all alerts for a user
 */
export const clearAllAlerts = async (userId: string): Promise<void> => {
  const db = getDatabase();
  const alertsRef = ref(db, `users/${userId}/alerts`);
  
  return set(alertsRef, null);
};

/**
 * Subscribe to alerts for a user and receive them in real-time
 */
export const subscribeToAlerts = (
  userId: string,
  callback: (alerts: MonitoringAlert[]) => void
): (() => void) => {
  const db = getDatabase();
  const alertsRef = ref(db, `users/${userId}/alerts`);
  
  const handler = onValue(alertsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const alertsData = snapshot.val() as Record<string, MonitoringAlert>;
    const alertsList = Object.values(alertsData).sort((a, b) => b.timestamp - a.timestamp);
    
    callback(alertsList);
  });
  
  // Return a function to unsubscribe
  return () => off(alertsRef, 'value', handler);
};

