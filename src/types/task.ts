
export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "high" | "medium" | "low"
export type SkillLevel = "beginner" | "intermediate" | "advanced"
export type AgentType = "general" | "data-analysis" | "content-creation" | "project-management"

export interface Activity {
  type: "status_change" | "timer_update" | "comment" | "dependency_update" | "tag_update" | "priority_change" | "completion" | "split"
  timestamp: number
  details: string
}

export interface CoSRecommendation {
  id: string
  type: "task" | "time" | "leadership" | "agent"
  content: string
  timestamp: number
  feedback?: "positive" | "negative"
  priority?: "low" | "medium" | "high"
  impact?: number // 0-100 score for recommendation impact
  actualDuration?: number // in minutes
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  estimatedDuration: number // in minutes
  actualDuration: number // in minutes
  priority?: TaskPriority
  dependencies?: string[] // array of task IDs
  tags?: string[]
  createdAt?: number
  updatedAt?: number
  isTimerRunning?: boolean
  startTime?: number // timestamp when timer was last started
  totalElapsedTime?: number // total time spent on task in milliseconds
  assignedTo?: string // user ID of assigned person
  completionPercentage?: number // 0-100
  lastActivity?: Activity
  activities?: Activity[]
  comments?: Array<{
    id: string
    text: string
    userId: string
    timestamp: number
    parentId?: string // for threaded discussions
    lastEdited?: number // timestamp when comment was last edited
  }>
  metadata?: {
    complexity: "low" | "medium" | "high"
    impact: "low" | "medium" | "high"
    businessValue: number // 1-10
    learningOpportunity: number // 1-10
    domain?: string
    skillRequirements?: SkillLevel[]
    aiEligible?: boolean
    externalStakeholder?: boolean
    performanceHistory?: {
      averageCompletionTime: number
      accuracyRate: number
    }
    timeExpectation?: number // expected completion time in minutes
    autoSplitEligible?: boolean // whether the task can be auto-split
    personalizationScore?: number // 0-100, calculated based on user match
    agentRecommendations?: {
      suggestedAgentType?: AgentType
      confidence: number
      reasoning: string
    }
    gamification?: {
      points: number
      badges: string[]
      achievements: string[]
      leaderboardPosition?: number
      skillProgress?: Record<string, number> // skill name -> progress (0-100)
    }
  }
}

export interface TaskInput extends Omit<Task, "id" | "createdAt" | "updatedAt" | "isTimerRunning" | "totalElapsedTime" | "lastActivity" | "activities"> {}

export interface PersonalizationPreferences {
  workloadThreshold: number // hours per week
  notificationFrequency: "high" | "medium" | "low"
  delegationPreference: "aggressive" | "balanced" | "conservative"
  communicationStyle: "formal" | "casual"
  skillFocus: string[]
  learningGoals: string[]
  agentInteractionLevel: "proactive" | "reactive" | "minimal"
  preferredAgentTypes: AgentType[]
}

export interface Agent {
  id: string
  type: AgentType
  name: string
  skills: string[]
  currentLoad: number // percentage
  assignedTasks: string[] // task IDs
  performance: {
    successRate: number
    averageTaskTime: number
    tasksCompleted: number
  }
  createdAt: number
  lastActive: number
  status: "active" | "inactive" | "overloaded"
  specializationScore: Record<string, number> // domain -> score
}
