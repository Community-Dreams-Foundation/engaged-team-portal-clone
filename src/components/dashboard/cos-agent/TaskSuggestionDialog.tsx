
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, Tag, BrainCircuit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createTask } from "@/utils/tasks/basicOperations"
import { useAuth } from "@/contexts/AuthContext"

interface TaskSuggestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestedTasks: Task[]
  onTaskAdded: (taskId: string) => void
}

export function TaskSuggestionDialog({
  open,
  onOpenChange,
  suggestedTasks,
  onTaskAdded
}: TaskSuggestionDialogProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isAddingTasks, setIsAddingTasks] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(current => 
      current.includes(taskId)
        ? current.filter(id => id !== taskId)
        : [...current, taskId]
    )
  }

  const handleAddSelectedTasks = async () => {
    if (!currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add tasks"
      })
      return
    }

    if (selectedTaskIds.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to add"
      })
      return
    }

    setIsAddingTasks(true)

    try {
      // Add each selected task to the user's tasks
      for (const taskId of selectedTaskIds) {
        const task = suggestedTasks.find(t => t.id === taskId)
        if (task) {
          // Create a clean task input without the AI-generated ID
          const { id, createdAt, updatedAt, isTimerRunning, totalElapsedTime, lastActivity, ...taskInput } = task
          
          // Add the task to the user's tasks
          const newTaskId = await createTask(currentUser.uid, taskInput)
          onTaskAdded(newTaskId)
        }
      }

      toast({
        title: "Tasks added successfully",
        description: `Added ${selectedTaskIds.length} task(s) to your list`
      })

      // Close the dialog and reset selection
      onOpenChange(false)
      setSelectedTaskIds([])
    } catch (error) {
      console.error("Error adding tasks:", error)
      toast({
        variant: "destructive",
        title: "Failed to add tasks",
        description: "An error occurred while adding the tasks"
      })
    } finally {
      setIsAddingTasks(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            AI-Generated Task Suggestions
          </DialogTitle>
          <DialogDescription>
            These tasks are suggested based on your work patterns and productivity data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="suggested" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="suggested">Suggested Tasks</TabsTrigger>
            <TabsTrigger value="info">How It Works</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggested" className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
            {suggestedTasks.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p>No task suggestions available at the moment</p>
              </div>
            ) : (
              suggestedTasks.map(task => (
                <Card 
                  key={task.id} 
                  className={`p-4 cursor-pointer border-2 transition-all ${
                    selectedTaskIds.includes(task.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/30'
                  }`}
                  onClick={() => toggleTaskSelection(task.id)}
                >
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.priority && (
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                        )}
                        
                        {task.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {task.estimatedDuration} min
                      </div>
                      
                      {selectedTaskIds.includes(task.id) && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="info">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">How Task Suggestions Work</h4>
                <p className="text-sm text-muted-foreground">
                  Your CoS agent analyzes your work patterns, completed tasks, and productivity metrics to suggest tasks that align with your skills and preferences.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Selection Criteria</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Work patterns and productivity cycles</li>
                  <li>Skill match and expertise areas</li>
                  <li>Team collaboration opportunities</li>
                  <li>Project requirements and deadlines</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Continuous Improvement</h4>
                <p className="text-sm text-muted-foreground">
                  The more you use the system, the better it gets at predicting your needs and suggesting relevant tasks.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">
              {selectedTaskIds.length} task(s) selected
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSelectedTasks} 
                disabled={selectedTaskIds.length === 0 || isAddingTasks}
              >
                {isAddingTasks ? 'Adding...' : 'Add Selected Tasks'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
