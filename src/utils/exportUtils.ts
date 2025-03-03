
import { Task, Activity } from "@/types/task";

/**
 * Converts task data to CSV format for export
 */
export function tasksToCSV(tasks: Task[]): string {
  // Define CSV header
  const headers = [
    "Task ID",
    "Title",
    "Description",
    "Status",
    "Priority",
    "Created At",
    "Due Date",
    "Estimated Duration (min)",
    "Actual Duration (min)",
    "Completion %",
    "Tags",
  ];
  
  // Create CSV content with headers
  let csvContent = headers.join(",") + "\n";
  
  // Add task data rows
  tasks.forEach(task => {
    const row = [
      task.id,
      `"${(task.title || "").replace(/"/g, '""')}"`, // Escape quotes in title
      `"${(task.description || "").replace(/"/g, '""')}"`, // Escape quotes in description
      task.status,
      task.priority || "medium",
      task.createdAt ? new Date(task.createdAt).toISOString() : "",
      task.dueDate ? new Date(task.dueDate).toISOString() : "",
      task.estimatedDuration || 0,
      task.actualDuration || 0,
      task.completionPercentage || 0,
      task.tags ? `"${task.tags.join(", ")}"` : "",
    ];
    
    csvContent += row.join(",") + "\n";
  });
  
  return csvContent;
}

/**
 * Converts activity data to CSV format for export
 */
export function activitiesToCSV(activities: Array<{taskId: string; taskTitle: string; activity: Activity}>): string {
  // Define CSV header
  const headers = [
    "Task ID",
    "Task Title",
    "Activity Type",
    "Timestamp",
    "Details"
  ];
  
  // Create CSV content with headers
  let csvContent = headers.join(",") + "\n";
  
  // Add activity data rows
  activities.forEach(item => {
    const row = [
      item.taskId,
      `"${(item.taskTitle || "").replace(/"/g, '""')}"`, // Escape quotes in title
      item.activity.type,
      new Date(item.activity.timestamp).toISOString(),
      `"${(item.activity.details || "").replace(/"/g, '""')}"`, // Escape quotes in details
    ];
    
    csvContent += row.join(",") + "\n";
  });
  
  return csvContent;
}

/**
 * Generates a downloadable CSV file from content
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create a download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  // Add link to document, click it to download, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calculate task completion metrics
 */
export function calculateTaskMetrics(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const todo = tasks.filter(t => t.status === "todo").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // Calculate average durations
  const completedTasks = tasks.filter(t => t.status === "completed" && t.estimatedDuration && t.actualDuration);
  
  let avgEstimatedDuration = 0;
  let avgActualDuration = 0;
  let estimationAccuracy = 0;
  
  if (completedTasks.length > 0) {
    avgEstimatedDuration = completedTasks.reduce((acc, task) => acc + (task.estimatedDuration || 0), 0) / completedTasks.length;
    avgActualDuration = completedTasks.reduce((acc, task) => acc + (task.actualDuration || 0), 0) / completedTasks.length;
    estimationAccuracy = avgEstimatedDuration > 0 ? (avgActualDuration / avgEstimatedDuration) * 100 : 0;
  }
  
  // Priority distribution
  const highPriority = tasks.filter(t => t.priority === "high").length;
  const mediumPriority = tasks.filter(t => t.priority === "medium").length;
  const lowPriority = tasks.filter(t => t.priority === "low").length;
  
  // Due date metrics
  const now = Date.now();
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== "completed").length;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    blocked,
    completionRate,
    avgEstimatedDuration,
    avgActualDuration,
    estimationAccuracy,
    priorityDistribution: {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority
    },
    overdue
  };
}

/**
 * Get trend data for tasks over time
 */
export function calculateTaskTrends(tasks: Task[], days: number = 30) {
  const result = [];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < days; i++) {
    const date = now - (i * oneDayMs);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    const dayTasks = tasks.filter(task => {
      const updatedAt = task.updatedAt || 0;
      return updatedAt >= dateStart.getTime() && updatedAt <= dateEnd.getTime();
    });
    
    const completed = dayTasks.filter(t => t.status === "completed").length;
    
    result.push({
      date: dateStart.toISOString().split('T')[0],
      completed,
      created: dayTasks.filter(t => t.createdAt && t.createdAt >= dateStart.getTime() && t.createdAt <= dateEnd.getTime()).length
    });
  }
  
  // Reverse to get chronological order
  return result.reverse();
}
