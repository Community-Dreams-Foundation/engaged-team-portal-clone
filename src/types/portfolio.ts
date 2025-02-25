
export type PortfolioFormat = "linkedin" | "github" | "website";

export interface PortfolioMetadata {
  title: string;
  description: string;
  lastUpdated: number;
  format: PortfolioFormat;
  visibility: "public" | "private";
}

export interface PortfolioPreferences {
  template: "default" | "minimal" | "detailed";
  primaryColor: string;
  showMetrics: boolean;
  selectedItems: string[];
}

export interface PortfolioMetrics {
  tasksCompleted: number;
  efficiency: number;
  timesSaved: number;
  impactScore: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  impact: {
    timeEfficiency: number;
    tasksCompleted: number;
    efficiency: number;
  };
  metrics: {
    avgCompletionTime: number;
    tasksAheadOfSchedule: number;
    totalTasks: number;
  };
  skills: string[];
  achievements: string[];
  createdAt: number;
  updatedAt: number;
  projectHighlights: string[];
}

export interface Portfolio {
  userId: string;
  metadata: PortfolioMetadata;
  items: PortfolioItem[];
  metrics: PortfolioMetrics;
  preferences: PortfolioPreferences;
}
