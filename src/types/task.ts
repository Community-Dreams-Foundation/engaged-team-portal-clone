
export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "high" | "medium" | "low"
export type SkillLevel = "beginner" | "intermediate" | "advanced"

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
  lastActivity?: {
    type: "status_change" | "timer_update" | "comment" | "dependency_update"
    timestamp: number
    details?: string
  }
  comments?: Array<{
    id: string
    text: string
    userId: string
    timestamp: number
    parentId?: string // for threaded discussions
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
  }
}

// New type for task creation
export interface TaskInput extends Omit<Task, "id" | "createdAt" | "updatedAt" | "isTimerRunning" | "totalElapsedTime" | "lastActivity"> {}

// New type for personalization preferences
export interface PersonalizationPreferences {
  workloadThreshold: number // hours per week
  notificationFrequency: "high" | "medium" | "low"
  delegationPreference: "aggressive" | "balanced" | "conservative"
  communicationStyle: "formal" | "casual"
  skillFocus: string[]
  learningGoals: string[]
}

