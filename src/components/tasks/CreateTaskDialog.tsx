
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { createTask } from "@/utils/tasks/basicOperations"
import { TaskInput, TaskPriority } from "@/types/task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated?: () => void
}

export function CreateTaskDialog({ open, onOpenChange, onTaskCreated }: CreateTaskDialogProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState(30)
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [tags, setTags] = useState("")
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium")
  
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setEstimatedDuration(30)
    setPriority("medium")
    setTags("")
    setComplexity("medium")
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create tasks",
      })
      return
    }
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Task",
        description: "Task title is required",
      })
      return
    }
    
    try {
      const taskInput: TaskInput = {
        title,
        description,
        status: "todo",
        estimatedDuration,
        actualDuration: 0,
        priority,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        assignedTo: currentUser.uid,
        completionPercentage: 0,
        metadata: {
          complexity,
          impact: "medium",
          businessValue: 7,
          learningOpportunity: 7,
          autoSplitEligible: complexity === "high",
        }
      }
      
      await createTask(currentUser.uid, taskInput)
      
      toast({
        title: "Task Created",
        description: "Your new task has been created successfully",
      })
      
      resetForm()
      onOpenChange(false)
      if (onTaskCreated) onTaskCreated()
      
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        variant: "destructive",
        title: "Error Creating Task",
        description: "Failed to create your task. Please try again.",
      })
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="development, design, research"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Complexity</Label>
            <RadioGroup 
              value={complexity} 
              onValueChange={(value: "low" | "medium" | "high") => setComplexity(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="complexity-low" />
                <Label htmlFor="complexity-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="complexity-medium" />
                <Label htmlFor="complexity-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="complexity-high" />
                <Label htmlFor="complexity-high">High</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
