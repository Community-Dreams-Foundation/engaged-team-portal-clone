
import { Task } from "@/types/task";
import { getDatabase, ref, set, get, push, onValue, off } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { AlertType } from "@/types/monitoring";

// Store alerts in Firebase
export const createAlert = async (
  userId: string,
  alertType: AlertType,
  taskId: string,
  message: string,
  details?: any
) => {
  const db = getDatabase();
  const alertsRef = ref(db, `users/${userId}/alerts`);
  
  await push(alertsRef, {
    type: alertType,
    taskId,
    message,
    details,
    timestamp: Date.now(),
    read: false
  });
};

// Get all user alerts
export const getUserAlerts = async (userId: string) => {
  const db = getDatabase();
  const alertsRef = ref(db, `users/${userId}/alerts`);
  
  const snapshot = await get(alertsRef);
  if (!snapshot.exists()) {
    return [];
  }
  
  // Convert to array and sort by timestamp
  const alerts = Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...(data as any)
  }));
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

// Mark alert as read
export const markAlertAsRead = async (userId: string, alertId: string) => {
  const db = getDatabase();
  const alertRef = ref(db, `users/${userId}/alerts/${alertId}`);
  
  await set(alertRef, { read: true });
};

// Function to check for overdue tasks
export const checkOverdueTasks = (tasks: Task[]) => {
  const now = Date.now();
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    if (task.status === "completed") return false;
    
    const dueDate = new Date(task.dueDate).getTime();
    return now > dueDate;
  });
};

// Function to check for approaching deadlines (tasks due within 24 hours)
export const checkApproachingDeadlines = (tasks: Task[]) => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    if (task.status === "completed") return false;
    
    const dueDate = new Date(task.dueDate).getTime();
    return dueDate > now && dueDate - now < oneDayMs;
  });
};

// Check if task duration exceeded estimated time
export const checkDurationExceeded = (tasks: Task[]) => {
  return tasks.filter(task => {
    if (!task.estimatedDuration) return false;
    if (task.status === "completed") return false;
    
    const totalElapsedMs = task.totalElapsedTime || 0;
    const totalElapsedMinutes = totalElapsedMs / (60 * 1000);
    
    return totalElapsedMinutes > task.estimatedDuration;
  });
};

// Check for blocked dependencies
export const checkBlockedDependencies = (tasks: Task[]) => {
  const blockedTasks: Task[] = [];
  
  tasks.forEach(task => {
    if (!task.dependencies || task.dependencies.length === 0) return;
    if (task.status !== "blocked") return;
    
    // Check if any dependencies are not completed
    const hasBlockingDependencies = task.dependencies.some(depId => {
      const dependencyTask = tasks.find(t => t.id === depId);
      return dependencyTask && dependencyTask.status !== "completed";
    });
    
    if (hasBlockingDependencies) {
      blockedTasks.push(task);
    }
  });
  
  return blockedTasks;
};

// Check for performance anomalies
export const checkPerformanceAnomalies = (tasks: Task[]) => {
  const anomalies: { task: Task; reason: string }[] = [];
  
  tasks.forEach(task => {
    if (task.status === "completed") {
      // Check for tasks that took much longer than estimated
      if (task.estimatedDuration && task.totalElapsedTime) {
        const totalElapsedMinutes = task.totalElapsedTime / (60 * 1000);
        
        if (totalElapsedMinutes > task.estimatedDuration * 2) {
          anomalies.push({
            task,
            reason: `Took ${Math.round(totalElapsedMinutes)} minutes vs estimated ${task.estimatedDuration} minutes`
          });
        }
      }
    }
    
    // Check for frequently restarted tasks
    if (task.restartCount && task.restartCount > 2) {
      anomalies.push({
        task,
        reason: `Restarted ${task.restartCount} times`
      });
    }
  });
  
  return anomalies;
};

// Get monitoring stats for user
export const getMonitoringStats = async (userId: string) => {
  const db = getDatabase();
  const tasksRef = ref(db, `users/${userId}/tasks`);
  
  const snapshot = await get(tasksRef);
  if (!snapshot.exists()) {
    return {
      taskCompletionRate: 0,
      onTimeCompletion: 0,
      averageTaskDuration: 0,
      blockedTasks: 0
    };
  }
  
  const tasksData = snapshot.val();
  const tasks = Object.values(tasksData) as Task[];
  
  // Calculate task completion rate
  const completedTasks = tasks.filter(task => task.status === "completed");
  const taskCompletionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;
  
  // Calculate on-time completion rate
  const onTimeCompletions = completedTasks.filter(task => {
    if (!task.dueDate || !task.completedAt) return false;
    
    const dueDate = new Date(task.dueDate).getTime();
    return task.completedAt <= dueDate;
  });
  
  const onTimeCompletionRate = completedTasks.length > 0
    ? Math.round((onTimeCompletions.length / completedTasks.length) * 100)
    : 0;
  
  // Calculate average task duration
  const tasksWithDuration = completedTasks.filter(task => task.totalElapsedTime);
  const totalDuration = tasksWithDuration.reduce(
    (sum, task) => sum + (task.totalElapsedTime || 0), 
    0
  );
  
  const averageTaskDuration = tasksWithDuration.length > 0
    ? Math.round((totalDuration / tasksWithDuration.length) / (60 * 1000))
    : 0;
  
  // Count blocked tasks
  const blockedTasksCount = tasks.filter(task => task.status === "blocked").length;
  
  return {
    taskCompletionRate,
    onTimeCompletion: onTimeCompletionRate,
    averageTaskDuration,
    blockedTasks: blockedTasksCount
  };
};

// Listen for overdue tasks and approaching deadlines in real-time
export const useTaskAlerts = (userId: string, tasks: Task[]) => {
  const { toast } = useToast();
  
  // Check for issues that should trigger alerts
  const overdueCheck = () => {
    const overdueTasks = checkOverdueTasks(tasks);
    
    overdueTasks.forEach(task => {
      // Create alert in database
      createAlert(
        userId, 
        "overdue",
        task.id,
        `Task "${task.title}" is overdue`
      );
      
      // Show toast notification
      toast({
        title: "Task Overdue",
        description: `"${task.title}" was due on ${new Date(task.dueDate!).toLocaleDateString()}`,
        variant: "destructive",
        action: {
          label: "View Task",
          onClick: () => console.log("View task clicked", task.id)
        }
      });
    });
  };
  
  const approachingDeadlinesCheck = () => {
    const approachingTasks = checkApproachingDeadlines(tasks);
    
    approachingTasks.forEach(task => {
      createAlert(
        userId,
        "approaching_deadline",
        task.id,
        `Task "${task.title}" is due soon`
      );
      
      toast({
        title: "Approaching Deadline",
        description: `"${task.title}" is due in less than 24 hours`,
        variant: "default",
        action: {
          label: "View Task",
          onClick: () => console.log("View task clicked", task.id)
        }
      });
    });
  };
  
  const durationExceededCheck = () => {
    const exceededTasks = checkDurationExceeded(tasks);
    
    exceededTasks.forEach(task => {
      createAlert(
        userId,
        "duration_exceeded",
        task.id,
        `Task "${task.title}" has exceeded estimated duration`
      );
      
      toast({
        title: "Duration Exceeded",
        description: `"${task.title}" has taken longer than the estimated ${task.estimatedDuration} minutes`,
        variant: "default",
        action: {
          label: "View Task",
          onClick: () => console.log("View task clicked", task.id)
        }
      });
    });
  };
  
  // Run initial checks
  if (userId && tasks.length > 0) {
    overdueCheck();
    approachingDeadlinesCheck();
    durationExceededCheck();
  }
};
