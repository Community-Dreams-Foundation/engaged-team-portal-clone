
export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "high" | "medium" | "low"

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
}
