
import { getDatabase, ref, set, get, update } from "firebase/database";
import type { PerformanceMetrics, PersonalGoal } from "@/types/performance";

export const fetchPerformanceData = async (userId: string): Promise<PerformanceMetrics> => {
  const db = getDatabase();
  const performanceRef = ref(db, `users/${userId}/performance`);
  const snapshot = await get(performanceRef);

  if (!snapshot.exists()) {
    // Initialize default performance data for new users
    const defaultData: PerformanceMetrics = {
      efficiency: 92,
      totalTasks: 0,
      tasksThisWeek: 0,
      averageTaskTime: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 1000,
      leaderboardRank: 1,
      totalParticipants: 1,
      achievements: [
        {
          id: "first-task",
          title: "First Steps",
          description: "Completed your first task",
          icon: "trophy",
          earnedAt: Date.now()
        }
      ],
      goals: [],
      weeklyTasks: [
        { name: "Mon", tasks: 0 },
        { name: "Tue", tasks: 0 },
        { name: "Wed", tasks: 0 },
        { name: "Thu", tasks: 0 },
        { name: "Fri", tasks: 0 }
      ]
    };

    await set(performanceRef, defaultData);
    return defaultData;
  }

  return snapshot.val();
};

export const addPersonalGoal = async (userId: string, goal: Omit<PersonalGoal, "id" | "createdAt">) => {
  const db = getDatabase();
  const goalsRef = ref(db, `users/${userId}/performance/goals`);
  
  const newGoal: PersonalGoal = {
    ...goal,
    id: `goal-${Date.now()}`,
    createdAt: Date.now(),
  };

  await update(goalsRef, {
    [newGoal.id]: newGoal
  });

  return newGoal;
};

export const updateGoalProgress = async (userId: string, goalId: string, current: number) => {
  const db = getDatabase();
  const goalRef = ref(db, `users/${userId}/performance/goals/${goalId}`);
  
  await update(goalRef, {
    current
  });
};

export const calculateLevel = (experience: number): { level: number; nextLevelXP: number } => {
  const baseXP = 1000;
  const exponent = 1.5;
  
  let level = 1;
  let totalXPForNextLevel = baseXP;
  
  while (experience >= totalXPForNextLevel) {
    level++;
    totalXPForNextLevel += Math.floor(baseXP * Math.pow(level, exponent));
  }
  
  return {
    level,
    nextLevelXP: totalXPForNextLevel
  };
};
