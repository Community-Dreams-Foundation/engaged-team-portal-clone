import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Task, TaskStatus, RecurringTaskConfig } from "@/types/task"
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
import { TaskFiltersState } from "@/components/tasks/TaskFilters"
import { isAfter, isBefore, isWithinInterval, addDays, addWeeks, addMonths } from "date-fns"

interface KanbanBoardProps {
  filters?: TaskFiltersState;
  showRecurring?: boolean;
}

export const KanbanBoard = forwardRef<{loadTasks: () => Promise<void>}, KanbanBoardProps>(
  ({ filters, showRecurring = false }, ref) => {
    const { currentUser } = useAuth()
    const { toast } = useToast()
    const [tasks, setTasks] = useState<Task[]>([])
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    const { toggleTimer } = useTaskTimer(filteredTasks, setFilteredTasks, currentUser?.uid)
    const { handleDragStart, handleDragOver, handleDrop } = useTaskDragDrop(filteredTasks, setFilteredTasks, currentUser?.uid)

    const loadTasks = useCallback(async () => {
      if (!currentUser?.uid) return
      
      try {
        setLoading(true)
        const fetchedTasks = await fetchTasks(currentUser.uid)
        
        if (showRecurring) {
          const now = new Date().getTime()
          const tasksToCreate: Task[] = []
          
          fetchedTasks.forEach(task => {
            if (task.status === "completed" && 
                task.recurringConfig?.isRecurring && 
                task.recurringConfig.nextOccurrence && 
                task.recurringConfig.nextOccurrence <= now) {
              
              let shouldCreateNew = true
              
              if (task.recurringConfig.endDate && 
                  task.recurringConfig.nextOccurrence > task.recurringConfig.endDate) {
                shouldCreateNew = false
              }
              
              if (task.recurringConfig.endAfterOccurrences && 
                  task.recurringConfig.occurrencesCompleted && 
                  task.recurringConfig.occurrencesCompleted >= task.recurringConfig.endAfterOccurrences) {
                shouldCreateNew = false
              }
              
              if (shouldCreateNew) {
                const nextDate = new Date(task.recurringConfig.nextOccurrence)
                let subsequentDate = new Date(task.recurringConfig.nextOccurrence)
                
                switch (task.recurringConfig.pattern) {
                  case "daily":
                    subsequentDate = addDays(nextDate, task.recurringConfig.interval)
                    break
                  case "weekly":
                    subsequentDate = addWeeks(nextDate, task.recurringConfig.interval)
                    break
                  case "biweekly":
                    subsequentDate = addWeeks(nextDate, 2 * task.recurringConfig.interval)
                    break
                  case "monthly":
                    subsequentDate = addMonths(nextDate, task.recurringConfig.interval)
                    break
                  default:
                    subsequentDate = addDays(nextDate, task.recurringConfig.interval)
                }
                
                const newTask: Task = {
                  ...task,
                  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  status: "todo",
                  isTimerRunning: false,
                  totalElapsedTime: 0,
                  actualDuration: 0,
                  completionPercentage: 0,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  startTime: undefined,
                  dueDate: task.dueDate ? 
                    task.dueDate + (subsequentDate.getTime() - task.recurringConfig.nextOccurrence) : 
                    undefined,
                  recurringConfig: {
                    ...task.recurringConfig,
                    nextOccurrence: subsequentDate.getTime(),
                    occurrencesCompleted: (task.recurringConfig.occurrencesCompleted || 0) + 1
                  },
                  lastActivity: {
                    type: "status_change",
                    timestamp: Date.now(),
                    details: "Recurring task created"
                  }
                }
                
                tasksToCreate.push(newTask)
                
                const taskIndex = fetchedTasks.findIndex(t => t.id === task.id)
                if (taskIndex >= 0) {
                  fetchedTasks[taskIndex] = {
                    ...fetchedTasks[taskIndex],
                    recurringConfig: {
                      ...fetchedTasks[taskIndex].recurringConfig as RecurringTaskConfig,
                      occurrencesCompleted: (fetchedTasks[taskIndex].recurringConfig?.occurrencesCompleted || 0) + 1,
                    }
                  }
                }
              }
            }
          })
          
          if (tasksToCreate.length > 0) {
            fetchedTasks.push(...tasksToCreate)
            
            toast({
              title: "Recurring Tasks Created",
              description: `${tasksToCreate.length} recurring task${tasksToCreate.length > 1 ? 's were' : ' was'} automatically created.`,
            })
          }
        }
        
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
    }, [currentUser?.uid, toast, showRecurring])

    useEffect(() => {
      if (!filters) {
        setFilteredTasks(tasks);
        return;
      }
      
      let filtered = [...tasks];
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      if (filters.dateRange.from || filters.dateRange.to) {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          
          const taskDueDate = new Date(task.dueDate);
          
          if (filters.dateRange.from && filters.dateRange.to) {
            return isWithinInterval(taskDueDate, {
              start: filters.dateRange.from,
              end: filters.dateRange.to
            });
          } else if (filters.dateRange.from) {
            return isAfter(taskDueDate, filters.dateRange.from) || 
                  taskDueDate.getTime() === filters.dateRange.from.getTime();
          } else if (filters.dateRange.to) {
            return isBefore(taskDueDate, filters.dateRange.to) || 
                  taskDueDate.getTime() === filters.dateRange.to.getTime();
          }
          
          return true;
        });
      }
      
      if (filters.priorities.length > 0) {
        filtered = filtered.filter(task => 
          task.priority && filters.priorities.includes(task.priority)
        );
      }
      
      if (filters.tags.length > 0) {
        filtered = filtered.filter(task => 
          task.tags && filters.tags.some(tag => task.tags?.includes(tag))
        );
      }
      
      setFilteredTasks(filtered);
    }, [tasks, filters]);

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
        <TaskAnalytics tasks={filteredTasks} />
        <TaskMonitor tasks={filteredTasks} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(column => (
            <TaskColumn
              key={column.status}
              title={column.title}
              status={column.status}
              tasks={filteredTasks}
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
)

KanbanBoard.displayName = "KanbanBoard"
