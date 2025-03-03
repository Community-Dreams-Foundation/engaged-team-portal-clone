
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { ChevronRight, Kanban, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog"
import { ViewAllTasksDialog } from "@/components/tasks/ViewAllTasksDialog"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { Task } from "@/types/task"

export function KanbanSection() {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const kanbanBoardRef = useRef<any>(null)
  const { createTaskRecommendation } = useCosRecommendations()
  
  const handleTaskCreated = (task: Partial<Task>) => {
    // Force reload tasks in KanbanBoard
    if (kanbanBoardRef.current && kanbanBoardRef.current.loadTasks) {
      kanbanBoardRef.current.loadTasks()
    }
    
    // Generate a recommendation if we have task info
    if (task.id && task.title) {
      createTaskRecommendation(
        task.id,
        task.title,
        `Consider breaking down "${task.title}" into smaller subtasks for better management and tracking.`,
        "medium"
      )
    }
    
    // Reopen if needed
    setShowAllTasks(prev => {
      if (prev) return true // Keep open if it was already open
      return false
    })
  }
  
  return (
    <div className="col-span-full">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Kanban className="mr-2 h-5 w-5 text-primary" />
              Task Management Board
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-sm gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-sm gap-1"
                onClick={() => setShowCreateTask(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-primary hover:underline flex items-center"
                onClick={() => setShowAllTasks(true)}
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your tasks by dragging them across different stages
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <KanbanBoard ref={kanbanBoardRef} />
        </CardContent>
      </Card>
      
      {/* Create Task Dialog */}
      <CreateTaskDialog 
        isOpen={showCreateTask} 
        onOpenChange={setShowCreateTask} 
        onTaskCreated={handleTaskCreated}
      />
      
      {/* View All Tasks Dialog */}
      <ViewAllTasksDialog
        open={showAllTasks}
        onOpenChange={setShowAllTasks}
      />
    </div>
  );
}
