import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash, Timer, MoreVertical, Bot, CalendarIcon } from "lucide-react"
import { Task, TaskStatus } from "@/types/task"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fetchTasks } from "@/utils/tasks/basicOperations"

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("todo")
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const { createTask, fetchTasks, deleteTask, updateStatus } = useTaskOperations()
  const { recommendations } = useCosRecommendations()
  const taskRecommendations = recommendations.filter(rec => rec.type === "task")

  useEffect(() => {
    if (currentUser) {
      loadTasks(currentUser.uid)
    }
  }, [currentUser])

  const loadTasks = async (userId: string) => {
    try {
      const fetchedTasks = await fetchTasks(userId)
      setTasks(fetchedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tasks. Please try again."
      })
    }
  }

  const handleAddTask = async () => {
    if (!newTask.trim() || !currentUser) return

    try {
      const taskId = await createTask(currentUser.uid, {
        title: newTask,
        description: "",
        status: "todo",
        estimatedDuration: 60,
        actualDuration: 0
      })

      setTasks(prevTasks => [...prevTasks, {
        id: taskId,
        title: newTask,
        description: "",
        status: "todo",
        estimatedDuration: 60,
        actualDuration: 0
      }])

      setNewTask("")
      toast({
        title: "Task added",
        description: "Your task has been added successfully."
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add task. Please try again."
      })
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!currentUser) return

    try {
      await updateStatus(currentUser.uid, taskId, status)
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      )
      toast({
        title: "Status updated",
        description: "Task status has been updated."
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again."
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!currentUser || !taskToDelete) return

    try {
      await deleteTask(currentUser.uid, taskToDelete)
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete))
      setTaskToDelete(null)
      setDeleteOpen(false)
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully."
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task. Please try again."
      })
    }
  }

  const handleOpenDelete = (taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteOpen(true)
  }

  const filteredTasks = tasks.filter(task => task.status === selectedStatus)

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Manage your tasks efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleAddTask()
                }
              }}
            />
            <Button type="button" onClick={handleAddTask}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="flex space-x-4">
            <Button
              variant={selectedStatus === "todo" ? "secondary" : "outline"}
              onClick={() => setSelectedStatus("todo")}
            >
              To Do
            </Button>
            <Button
              variant={selectedStatus === "not-started" ? "secondary" : "outline"}
              onClick={() => setSelectedStatus("not-started")}
            >
              Not Started
            </Button>
            <Button
              variant={selectedStatus === "in-progress" ? "secondary" : "outline"}
              onClick={() => setSelectedStatus("in-progress")}
            >
              In Progress
            </Button>
            <Button
              variant={selectedStatus === "completed" ? "secondary" : "outline"}
              onClick={() => setSelectedStatus("completed")}
            >
              Completed
            </Button>
            <Button
              variant={selectedStatus === "blocked" ? "secondary" : "outline"}
              onClick={() => setSelectedStatus("blocked")}
            >
              Blocked
            </Button>
          </div>

          <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4 space-y-2">
              {filteredTasks.map(task => (
                <Card key={task.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.status === "completed"}
                        onCheckedChange={checked =>
                          handleStatusChange(
                            task.id,
                            checked ? "completed" : "todo"
                          )
                        }
                      />
                      <Label htmlFor={`task-${task.id}`}>{task.title}</Label>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Timer className="w-4 h-4 mr-2" />
                          Start Timer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(task.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tasks in this category.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {taskRecommendations.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">CoS Task Recommendations</h3>
          </div>
          
          <div className="space-y-2">
            {taskRecommendations.map(recommendation => (
              <div 
                key={recommendation.id}
                className="p-3 bg-muted/50 border rounded-md hover:bg-muted/70 transition-colors"
              >
                <div className="flex justify-between">
                  <p className="text-sm">{recommendation.content}</p>
                  <Button variant="ghost" size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
