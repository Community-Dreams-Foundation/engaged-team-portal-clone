
import { getDatabase, ref, get, set, update } from "firebase/database"
import { Task } from "@/types/task"
import { Portfolio, PortfolioItem } from "@/types/portfolio"

export const generatePortfolioFromTasks = async (
  userId: string,
  tasks: Task[]
): Promise<Portfolio> => {
  const portfolioItems: PortfolioItem[] = tasks
    .filter((task) => task.status === "completed")
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      impact: {
        timeEfficiency: calculateTimeEfficiency(task),
        tasksCompleted: 1,
        efficiency: calculateEfficiency(task),
      },
      metrics: {
        avgCompletionTime: task.actualDuration || 0,
        tasksAheadOfSchedule: task.actualDuration && task.estimatedDuration ? 
          (task.actualDuration < task.estimatedDuration ? 1 : 0) : 0,
        totalTasks: 1
      },
      skills: task.tags || [],
      achievements: generateAchievements(task),
      createdAt: task.createdAt || Date.now(),
      updatedAt: task.updatedAt || Date.now(),
      projectHighlights: [
        `Completed ${task.title} with ${calculateEfficiency(task)}% efficiency`,
        task.actualDuration && task.estimatedDuration && task.actualDuration < task.estimatedDuration ?
          `Completed ahead of schedule by ${task.estimatedDuration - task.actualDuration} minutes` : 
          undefined,
      ].filter(Boolean) as string[],
    }));

  const summary = generatePortfolioSummary(portfolioItems);

  return {
    userId,
    items: portfolioItems,
    summary,
    customization: {
      template: "default",
      primaryColor: "#4F46E5", // Indigo-600
      showMetrics: true,
      selectedItems: portfolioItems.map(item => item.id)
    },
    social: {
      linkedIn: { connected: false },
      github: { connected: false }
    },
    lastUpdated: Date.now()
  };
};

const calculateTimeEfficiency = (task: Task): number => {
  if (!task.actualDuration || !task.estimatedDuration) return 0;
  const improvement = ((task.estimatedDuration - task.actualDuration) / task.estimatedDuration) * 100;
  return Math.max(improvement, 0); // Only return positive efficiency
};

const calculateEfficiency = (task: Task): number => {
  if (!task.actualDuration || !task.estimatedDuration) return 0;
  return Math.min(100, 
    Math.round((task.estimatedDuration / task.actualDuration) * 100)
  );
};

const generateAchievements = (task: Task): string[] => {
  const achievements: string[] = [];
  
  if (task.completionPercentage === 100) {
    achievements.push("Completed task successfully");
  }
  
  if (task.actualDuration && task.estimatedDuration && 
      task.actualDuration < task.estimatedDuration) {
    achievements.push("Completed ahead of schedule");
  }
  
  if (task.metadata?.complexity === "high") {
    achievements.push("Handled complex task effectively");
  }
  
  return achievements;
};

const generatePortfolioSummary = (items: PortfolioItem[]) => {
  const totalProjects = items.length;
  
  // Calculate average efficiency
  const avgEfficiency = items.reduce((sum, item) => 
    sum + item.impact.efficiency, 0) / totalProjects;
  
  // Aggregate all skills and count occurrences
  const skillCount = items.reduce((acc, item) => {
    item.skills.forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // Get top skills (top 5 most frequent)
  const topSkills = Object.entries(skillCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([skill]) => skill);
  
  // Calculate overall impact
  const overallImpact = items.reduce((acc, item) => ({
    timesSaved: acc.timesSaved + (item.metrics.avgCompletionTime || 0),
    tasksCompleted: acc.tasksCompleted + item.metrics.totalTasks,
    efficiencyImprovement: acc.efficiencyImprovement + item.impact.timeEfficiency
  }), {
    timesSaved: 0,
    tasksCompleted: 0,
    efficiencyImprovement: 0
  });
  
  return {
    totalProjects,
    avgEfficiency,
    topSkills,
    overallImpact: {
      timesSaved: Math.round(overallImpact.timesSaved),
      tasksCompleted: overallImpact.tasksCompleted,
      efficiencyImprovement: Math.round(overallImpact.efficiencyImprovement / totalProjects)
    }
  };
};

export const savePortfolio = async (userId: string, portfolio: Portfolio) => {
  const db = getDatabase();
  const portfolioRef = ref(db, `users/${userId}/portfolio`);
  return set(portfolioRef, portfolio);
};

export const updatePortfolioCustomization = async (
  userId: string,
  customization: Portfolio["customization"]
) => {
  const db = getDatabase();
  const customizationRef = ref(db, `users/${userId}/portfolio/customization`);
  return update(customizationRef, customization);
};

export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
  const db = getDatabase();
  const portfolioRef = ref(db, `users/${userId}/portfolio`);
  const snapshot = await get(portfolioRef);
  return snapshot.exists() ? snapshot.val() : null;
};
