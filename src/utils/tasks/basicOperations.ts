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
      type: "status_change",
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

// New function for AI-powered task suggestions
export const suggestTasks = async (userId: string): Promise<Task[]> => {
  console.log('Generating AI task suggestions for user:', userId);
  
  // Mock AI-generated task suggestions based on "user behavior"
  const suggestedTasks: Task[] = [
    {
      id: `suggestion-${Date.now()}-1`,
      title: "Review project documentation",
      description: "Based on your recent activity, updating the project documentation would improve team collaboration.",
      status: "todo",
      estimatedDuration: 60,
      actualDuration: 0,
      priority: "medium",
      tags: ["documentation", "team", "ai-suggested"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTimerRunning: false,
      totalElapsedTime: 0,
      completionPercentage: 0,
      metadata: {
        complexity: "medium",
        impact: "medium",
        businessValue: 7,
        learningOpportunity: 5,
        autoSplitEligible: true,
        personalizationScore: 85,
        agentRecommendations: {
          suggestedAgentType: "content-creation",
          confidence: 0.92,
          reasoning: "Content creation skills needed for documentation work"
        }
      },
      lastActivity: {
        type: "status_change",
        timestamp: Date.now(),
        details: "AI suggested task"
      }
    },
    {
      id: `suggestion-${Date.now()}-2`,
      title: "Optimize performance bottlenecks",
      description: "Your metrics show application slowdowns. Consider optimizing critical functions.",
      status: "todo",
      estimatedDuration: 120,
      actualDuration: 0,
      priority: "high",
      tags: ["performance", "optimization", "ai-suggested"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTimerRunning: false,
      totalElapsedTime: 0,
      completionPercentage: 0,
      metadata: {
        complexity: "high",
        impact: "high",
        businessValue: 9,
        learningOpportunity: 8,
        autoSplitEligible: true,
        personalizationScore: 92,
        agentRecommendations: {
          suggestedAgentType: "data-analysis",
          confidence: 0.88,
          reasoning: "Technical analysis skills needed for performance optimization"
        }
      },
      lastActivity: {
        type: "status_change",
        timestamp: Date.now(),
        details: "AI suggested task"
      }
    }
  ];
  
  return suggestedTasks;
}

// New function for automated task categorization
export const categorizeTask = async (task: TaskInput): Promise<string[]> => {
  console.log('Auto-categorizing task:', task.title);
  
  // Simple keyword-based categorization - in a real app, this would use ML
  const title = task.title.toLowerCase();
  const description = task.description.toLowerCase();
  const contentToAnalyze = title + " " + description;
  
  const categories: string[] = [];
  
  // Detect development-related tasks
  if (contentToAnalyze.includes("code") || 
      contentToAnalyze.includes("develop") || 
      contentToAnalyze.includes("implement") ||
      contentToAnalyze.includes("bug") ||
      contentToAnalyze.includes("fix")) {
    categories.push("development");
  }
  
  // Detect design-related tasks
  if (contentToAnalyze.includes("design") || 
      contentToAnalyze.includes("ui") || 
      contentToAnalyze.includes("ux") ||
      contentToAnalyze.includes("interface") ||
      contentToAnalyze.includes("visual")) {
    categories.push("design");
  }
  
  // Detect documentation-related tasks
  if (contentToAnalyze.includes("document") || 
      contentToAnalyze.includes("write") || 
      contentToAnalyze.includes("guide") ||
      contentToAnalyze.includes("manual")) {
    categories.push("documentation");
  }
  
  // Detect meeting-related tasks
  if (contentToAnalyze.includes("meeting") || 
      contentToAnalyze.includes("call") || 
      contentToAnalyze.includes("discussion") ||
      contentToAnalyze.includes("sync")) {
    categories.push("meeting");
  }
  
  // Detect research-related tasks
  if (contentToAnalyze.includes("research") || 
      contentToAnalyze.includes("analyze") || 
      contentToAnalyze.includes("investigate") ||
      contentToAnalyze.includes("explore")) {
    categories.push("research");
  }
  
  // If no category was detected, use "other"
  if (categories.length === 0) {
    categories.push("other");
  }
  
  return categories;
}

// New function for team collaboration tasks
export const createTeamTask = async (
  userId: string, 
  task: TaskInput, 
  assignedUserIds: string[]
): Promise<string> => {
  console.log('Creating team task for user:', userId, 'assigned to:', assignedUserIds);
  
  // Create the task for the creator first
  const taskId = await createTask(userId, task);
  
  // Now create the same task for all team members
  for (const memberId of assignedUserIds) {
    if (memberId !== userId) { // Don't duplicate for the creator
      await createTask(memberId, {
        ...task,
        assignedTo: memberId,
        metadata: {
          complexity: task.metadata?.complexity || "medium",
          impact: task.metadata?.impact || "medium",
          businessValue: task.metadata?.businessValue || 5,
          learningOpportunity: task.metadata?.learningOpportunity || 5,
          ...((task.metadata || {}) as any),
          originalCreator: userId,
          originalTaskId: taskId,
          sharedTask: true,
          teamMembers: assignedUserIds
        }
      });
    }
  }
  
  return taskId;
}

// New function to sync task updates across team members
export const syncTeamTaskUpdate = async (userId: string, taskId: string, updateData: Partial<Task>): Promise<void> => {
  console.log('Syncing team task update:', taskId);
  
  // First update the original task
  await updateTask(userId, taskId, updateData);
  
  // In a real app, we would find all related tasks across team members
  // and update them with the same data
  // For this mock implementation, we'll just log it
  console.log('Team task update would be propagated to all assigned members');
}
