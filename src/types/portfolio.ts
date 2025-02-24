
export interface PortfolioItem {
  id: string
  title: string
  description: string
  impact: {
    timeEfficiency: number // percentage improvement in task completion time
    tasksCompleted: number
    efficiency: number // overall efficiency rating
  }
  metrics: {
    avgCompletionTime: number
    tasksAheadOfSchedule: number
    totalTasks: number
  }
  skills: string[]
  achievements: string[]
  createdAt: number
  updatedAt: number
  projectHighlights: string[]
  feedback?: Array<{
    id: string
    text: string
    rating: number
    from: string
    timestamp: number
  }>
}

export interface Portfolio {
  userId: string
  items: PortfolioItem[]
  summary: {
    totalProjects: number
    avgEfficiency: number
    topSkills: string[]
    overallImpact: {
      timesSaved: number // in minutes
      tasksCompleted: number
      efficiencyImprovement: number // percentage
    }
  }
  customization: {
    template: "default" | "minimal" | "detailed"
    primaryColor: string
    showMetrics: boolean
    selectedItems: string[] // IDs of items to show
  }
  social: {
    linkedIn?: {
      connected: boolean
      lastSync?: number
    }
    github?: {
      connected: boolean
      lastSync?: number
    }
  }
  lastUpdated: number
}
