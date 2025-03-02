
import { Task, CoSRecommendation } from "@/types/task";

// Generate task recommendations based on user activity and team context
export const generateTaskRecommendations = async (
  userId: string,
  tasks: Task[],
  userBehavior?: {
    mostFrequentTags?: string[],
    averageTaskDuration?: number,
    preferredWorkingHours?: { start: number, end: number },
    commonBlockers?: string[]
  }
): Promise<CoSRecommendation[]> => {
  console.log('Generating task recommendations for user:', userId);
  
  const recommendations: CoSRecommendation[] = [];
  
  // Check for overdue tasks
  const overdueTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    task.actualDuration > task.estimatedDuration
  );
  
  if (overdueTasks.length > 0) {
    recommendations.push({
      id: `rec-time-${Date.now()}-1`,
      type: "time",
      content: `You have ${overdueTasks.length} overdue tasks. Consider revising time estimates or breaking them into smaller subtasks.`,
      timestamp: Date.now(),
      priority: "high",
      impact: 90
    });
  }
  
  // Check for task dependencies that might be blocking progress
  const blockedTasks = tasks.filter(task => 
    task.status === 'blocked' || 
    (task.dependencies && task.dependencies.length > 0)
  );
  
  if (blockedTasks.length > 0) {
    recommendations.push({
      id: `rec-task-${Date.now()}-1`,
      type: "task",
      content: "Several tasks are blocked by dependencies. Focus on completing prerequisite tasks to unblock your workflow.",
      timestamp: Date.now(),
      priority: "medium",
      impact: 85
    });
  }
  
  // Check workload balance
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  if (inProgressTasks.length > 5) {
    recommendations.push({
      id: `rec-task-${Date.now()}-2`,
      type: "task",
      content: "You have many tasks in progress. Consider focusing on fewer tasks at once to improve completion rate.",
      timestamp: Date.now(),
      priority: "medium",
      impact: 75
    });
  }
  
  // Leadership recommendations
  const teamTasks = tasks.filter(task => task.metadata?.sharedTask === true);
  if (teamTasks.length > 0) {
    recommendations.push({
      id: `rec-leadership-${Date.now()}-1`,
      type: "leadership",
      content: "You're collaborating on several team tasks. Schedule a quick sync meeting to align on priorities.",
      timestamp: Date.now(),
      priority: "low",
      impact: 65
    });
  }
  
  // Agent assistance recommendations
  if (tasks.some(task => task.metadata?.complexity === 'high')) {
    recommendations.push({
      id: `rec-agent-${Date.now()}-1`,
      type: "agent",
      content: "You have complex tasks that could benefit from specialized expertise. Consider deploying a data analysis agent to assist.",
      timestamp: Date.now(),
      priority: "medium",
      impact: 80
    });
  }
  
  return recommendations;
}

// Analyze task patterns to suggest productivity improvements
export const analyzeTaskPatterns = async (
  userId: string, 
  completedTasks: Task[]
): Promise<CoSRecommendation[]> => {
  console.log('Analyzing task patterns for user:', userId);
  
  const recommendations: CoSRecommendation[] = [];
  
  // Calculate average completion time accuracy
  const timeEstimationAccuracies = completedTasks.map(task => {
    if (!task.actualDuration || !task.estimatedDuration) return null;
    return task.actualDuration / task.estimatedDuration;
  }).filter(ratio => ratio !== null) as number[];
  
  const averageAccuracy = timeEstimationAccuracies.reduce((sum, ratio) => sum + ratio, 0) / 
    (timeEstimationAccuracies.length || 1);
  
  if (averageAccuracy > 1.25) {
    recommendations.push({
      id: `rec-pattern-${Date.now()}-1`,
      type: "time",
      content: "Your tasks consistently take 25% longer than estimated. Consider adding a 25% buffer to future time estimates.",
      timestamp: Date.now(),
      priority: "medium",
      impact: 85,
      actualDuration: Math.round(averageAccuracy * 100) // Store the percentage
    });
  }
  
  // Find most productive time patterns (this would use real data in a production app)
  recommendations.push({
    id: `rec-pattern-${Date.now()}-2`,
    type: "time",
    content: "Based on your completion patterns, you're most productive in the morning. Consider scheduling complex tasks before noon.",
    timestamp: Date.now(),
    priority: "low",
    impact: 70
  });
  
  // Identify commonly occurring tags to suggest specialization
  const tagCounts: Record<string, number> = {};
  completedTasks.forEach(task => {
    task.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  const mostCommonTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
  
  if (mostCommonTags.length > 0) {
    recommendations.push({
      id: `rec-pattern-${Date.now()}-3`,
      type: "task",
      content: `You excel at tasks tagged with: ${mostCommonTags.join(', ')}. Consider focusing on these areas for maximum productivity.`,
      timestamp: Date.now(),
      priority: "medium",
      impact: 75
    });
  }
  
  return recommendations;
}

// Suggest team collaboration improvements
export const suggestTeamCollaboration = async (
  userId: string,
  teamMembers: Array<{id: string, name: string, skills: string[]}>
): Promise<CoSRecommendation[]> => {
  console.log('Generating team collaboration suggestions for user:', userId);
  
  const recommendations: CoSRecommendation[] = [];
  
  // Suggest delegation opportunities
  if (teamMembers.length > 1) {
    const specializedMembers = teamMembers.filter(member => 
      member.id !== userId && member.skills.length > 0
    );
    
    if (specializedMembers.length > 0) {
      const member = specializedMembers[0]; // Just use the first one for this example
      recommendations.push({
        id: `rec-team-${Date.now()}-1`,
        type: "leadership",
        content: `${member.name} has expertise in ${member.skills[0]}. Consider delegating related tasks to improve team efficiency.`,
        timestamp: Date.now(),
        priority: "medium",
        impact: 80
      });
    }
  }
  
  // Suggest knowledge sharing
  recommendations.push({
    id: `rec-team-${Date.now()}-2`,
    type: "leadership",
    content: "Schedule a weekly knowledge-sharing session with your team to reduce knowledge silos and improve collaboration.",
    timestamp: Date.now(),
    priority: "low",
    impact: 70
  });
  
  return recommendations;
}
