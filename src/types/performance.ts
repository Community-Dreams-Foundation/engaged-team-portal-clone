
export interface AnalyticsMetric {
  timestamp: number;
  value: number;
}

export interface SectionEngagement {
  sectionId: string;
  sectionName: string;
  viewDuration: number;
  clicks: number;
}

export interface PortfolioAnalytics {
  views: AnalyticsMetric[];
  uniqueVisitors: number;
  sectionEngagement: SectionEngagement[];
  platformPerformance: {
    linkedin: {
      shares: number;
      clicks: number;
      impressions: number;
    };
    github: {
      stars: number;
      forks: number;
      views: number;
    };
  };
  clickThroughRate: number;
}

export interface PersonalGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: "tasks" | "efficiency" | "views";
  deadline: number;
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: number;
}

export interface Feedback {
  id: string;
  text: string;
  rating: number;
  date: number;
  author: string;
  role: string;
  givenAt: number;
}

export interface PerformanceMetrics {
  taskCompletionRate: number;
  avgTaskTime: number;
  delegationEfficiency: number;
  feedbackScore: number;
}

