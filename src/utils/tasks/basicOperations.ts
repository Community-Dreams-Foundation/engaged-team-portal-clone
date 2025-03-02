
import { Task, TaskInput } from "@/types/task"

// Mock data to use instead of Firebase Realtime Database
const mockTasks: Record<string, Task[]> = {};

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  console.log('Fetching mock tasks for user:', userId);
  return mockTasks[userId] || [];
}

export const createTask = async (userId: string, task: TaskInput): Promise<string> => {
  console.log('Creating mock task for user:', userId);
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  const newTask: Task = {
    id: taskId,
    ...task,
    isTimerRunning: false,
    totalElapsedTime: 0,
    createdAt: now,
    updatedAt: now,
    completionPercentage: 0,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: "Task created"
    }
  };
  
  if (!mockTasks[userId]) {
    mockTasks[userId] = [];
  }
  
  mockTasks[userId].push(newTask);
  
  return taskId;
}

export const updateTask = async (userId: string, taskId: string, updateData: Partial<Task>): Promise<void> => {
  console.log('Updating mock task for user:', userId, 'taskId:', taskId);
  if (!mockTasks[userId]) return;
  
  const taskIndex = mockTasks[userId].findIndex(task => task.id === taskId);
  if (taskIndex === -1) return;
  
  const now = Date.now();
  mockTasks[userId][taskIndex] = {
    ...mockTasks[userId][taskIndex],
    ...updateData,
    updatedAt: now,
    lastActivity: {
      type: "update",
      timestamp: now,
      details: "Task updated"
    }
  };
}

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  console.log('Deleting mock task for user:', userId, 'taskId:', taskId);
  if (!mockTasks[userId]) return;
  
  mockTasks[userId] = mockTasks[userId].filter(task => task.id !== taskId);
}
