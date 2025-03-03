
import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskStatus } from "@/types/task"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { checkDependencies } from "@/utils/tasks/progressOperations"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { TaskColumn } from "@/components/tasks/TaskColumn"
import { TaskMonitor } from "./monitoring/TaskMonitor"
import { TaskAnalytics } from "./monitoring/TaskAnalytics"
import { useTaskTimer } from "@/hooks/useTaskTimer"
import { useTaskDragDrop } from "@/hooks/useTaskDragDrop"

// Extending the component to support ref
export const KanbanBoard = forwardRef((props, ref) => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const { toggleTimer } = useTaskTimer(tasks, setTasks, currentUser?.uid)
  const { handleDragStart, handleDragOver, handleDrop } = useTaskDragDrop(tasks, setTasks, currentUser?.uid)

  const loadTasks = useCallback(async () => {
    if (!currentUser?.uid) return
    
    try {
      setLoading(true)
      const fetchedTasks = await fetchTasks(currentUser.uid)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please refresh the page."
      })
    } finally {
      setLoading(false)
    }
  }, [currentUser?.uid, toast])

  // Expose loadTasks method via ref
  useImperativeHandle(ref, () => ({
    loadTasks
  }))

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const formatDuration = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }, [])

  const canStartTask = useCallback(async (taskId: string) => {
    if (!currentUser?.uid) return false
    return checkDependencies(currentUser.uid, taskId)
  }, [currentUser?.uid])

  const columns: { title: string, status: TaskStatus }[] = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in-progress" },
    { title: "Completed", status: "completed" }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <Card key={column.status} className="p-4">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TaskAnalytics tasks={tasks} />
      <TaskMonitor tasks={tasks} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={tasks}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onTimerToggle={toggleTimer}
            formatDuration={formatDuration}
            canStartTask={canStartTask}
          />
        ))}
      </div>
    </div>
  )
})

KanbanBoard.displayName = "KanbanBoard"
