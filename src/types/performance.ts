
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: number;
}

export interface PersonalGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: "tasks" | "efficiency" | "training" | "custom";
  deadline: number;
  createdAt: number;
}

export interface PerformanceMetrics {
  efficiency: number;
  totalTasks: number;
  tasksThisWeek: number;
  averageTaskTime: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  leaderboardRank: number;
  totalParticipants: number;
  achievements: Achievement[];
  goals: PersonalGoal[];
  weeklyTasks: Array<{
    name: string;
    tasks: number;
  }>;
}
