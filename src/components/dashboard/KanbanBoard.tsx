
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskStatus } from "@/types/task"
import { fetchTasks, updateTaskStatus, updateTaskTimer, checkDependencies } from "@/utils/taskUtils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  Timer, 
  AlertCircle, 
  Lock, 
  Play, 
  Pause, 
  Clock, 
  Tag, 
  Link2, 
  AlertTriangle 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getPriorityBadge = (priority?: string) => {
    const colors = {
      high: "text-red-500 border-red-500",
      medium: "text-yellow-500 border-yellow-500",
      low: "text-green-500 border-green-500"
    }
    return priority ? (
      <Badge variant="outline" className={colors[priority.toLowerCase()]}>
        {priority}
      </Badge>
    ) : null
  }

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(column => (
        <Card
          key={column.status}
          className="p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {column.title}
            <Badge variant="secondary" className="ml-auto">
              {tasks.filter(t => t.status === column.status).length}
            </Badge>
          </h3>
          
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === column.status)
              .map(task => (
                <Card
                  key={task.id}
                  className="p-3 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getPriorityBadge(task.priority)}
                          {task.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Est: {task.estimatedDuration}m
                      </span>
                      {task.dependencies?.length > 0 && (
                        <div className="flex items-center gap-1 ml-2">
                          <Link2 className="h-4 w-4" />
                          <span>{task.dependencies.length} dependencies</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(task.totalElapsedTime || 0)}
                        </span>
                        {task.dependencies?.length > 0 && !checkDependencies(currentUser?.uid || '', task.id) && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Lock className="h-4 w-4" />
                          </span>
                        )}
                        {task.isTimerRunning && (
                          <span className="flex items-center gap-1 text-green-500">
                            <Timer className="h-4 w-4 animate-pulse" />
                          </span>
                        )}
                        {(task.totalElapsedTime || 0) > task.estimatedDuration * 60 * 1000 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleTimer(task.id)}
                        disabled={task.status === 'completed'}
                      >
                        {task.isTimerRunning ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
