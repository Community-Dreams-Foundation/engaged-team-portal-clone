
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskStatus } from "@/types/task"
import { fetchTasks, updateTaskStatus, updateTaskTimer, checkDependencies } from "@/utils/taskUtils"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { TaskColumn } from "@/components/tasks/TaskColumn"
import { TaskMonitor } from "./monitoring/TaskMonitor"
import { TaskAnalytics } from "./monitoring/TaskAnalytics"

export function KanbanBoard() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid) return

    const loadTasks = async () => {
      try {
        const fetchedTasks = await fetchTasks(currentUser.uid)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error loading tasks:", error)
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Please try again later."
        })
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [currentUser?.uid, toast])

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.isTimerRunning && task.startTime) {
            const elapsedSinceStart = Date.now() - task.startTime
            const totalElapsed = (task.totalElapsedTime || 0) + elapsedSinceStart
            
            if (totalElapsed > task.estimatedDuration * 60 * 1000) {
              toast({
                title: "Task Duration Alert",
                description: `Task "${task.title}" has exceeded its estimated duration`,
                variant: "destructive"
              })
            }

            return {
              ...task,
              totalElapsedTime: totalElapsed
            }
          }
          return task
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [toast])

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    if (!currentUser?.uid || !taskId) return

    try {
      const canStart = await checkDependencies(currentUser.uid, taskId)
      if (newStatus === 'in-progress' && !canStart) {
        toast({
          variant: "destructive",
          title: "Cannot start task",
          description: "Not all dependencies are completed."
        })
        return
      }

      await updateTaskStatus(currentUser.uid, taskId, newStatus)
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Please try again later."
      })
    }
  }

  const toggleTimer = async (taskId: string) => {
    if (!currentUser?.uid) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const now = Date.now()
      const isTimerRunning = !task.isTimerRunning
      const startTime = isTimerRunning ? now : undefined
      const totalElapsedTime = !isTimerRunning 
        ? (task.totalElapsedTime || 0) + (task.startTime ? now - task.startTime : 0)
        : task.totalElapsedTime

      await updateTaskTimer(
        currentUser.uid,
        taskId,
        isTimerRunning,
        startTime,
        totalElapsedTime
      )

      setTasks(tasks.map(t => 
        t.id === taskId ? {
          ...t,
          isTimerRunning,
          startTime,
          totalElapsedTime
        } : t
      ))

    } catch (error) {
      console.error("Error updating timer:", error)
      toast({
        variant: "destructive",
        title: "Error updating timer",
        description: "Please try again later."
      })
    }
  }

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
}
