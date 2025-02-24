
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskStatus } from "@/types/task"
import { fetchTasks, updateTaskStatus } from "@/utils/taskUtils"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Timer, AlertCircle } from "lucide-react"

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
          <h3 className="font-semibold mb-4">{column.title}</h3>
          <div className="space-y-4">
            {tasks
              .filter(task => task.status === column.status)
              .map(task => (
                <Card
                  key={task.id}
                  className="p-3 cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.isTimerRunning && (
                        <Timer className="h-4 w-4 text-green-500 animate-pulse" />
                      )}
                      {(task.actualDuration > task.estimatedDuration) && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
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
