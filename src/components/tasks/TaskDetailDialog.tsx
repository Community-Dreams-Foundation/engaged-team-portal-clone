
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  Calendar, Clock, Tag, AlertCircle, CheckCircle, 
  MessageSquare, RotateCw, Calendar as CalendarIcon
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCommentSection } from "./TaskCommentSection"
import { TaskActivity } from "./TaskActivity"
import { format } from "date-fns"

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ 
  task, 
  open, 
  onOpenChange 
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const formatElapsedTime = (milliseconds: number = 0) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge className="bg-blue-500">To Do</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "blocked":
        return <Badge className="bg-red-500">Blocked</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="text-red-500 border-red-500">High</Badge>
      case "medium":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Medium</Badge>
      case "low":
        return <Badge variant="outline" className="text-green-500 border-green-500">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }
  
  const getNextOccurrenceText = () => {
    if (!task.recurringConfig?.nextOccurrence) return "Not set";
    return format(new Date(task.recurringConfig.nextOccurrence), "PPP");
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {task.title}
            {task.recurringConfig?.isRecurring && (
              <RotateCw className="h-5 w-5 text-blue-500" />
            )}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {getStatusBadge(task.status)}
            {task.priority && getPriorityBadge(task.priority)}
            
            {task.recurringConfig?.isRecurring && (
              <Badge className="bg-blue-500/10 text-blue-500">
                <RotateCw className="h-3.5 w-3.5 mr-1" />
                Recurring
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments
              {task.comments && task.comments.length > 0 && (
                <Badge className="ml-2 bg-primary" variant="secondary">
                  {task.comments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-auto space-y-6 p-1">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{task.description || "No description provided."}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Time & Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Estimated: {formatDuration(task.estimatedDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Spent: {formatElapsedTime(task.totalElapsedTime)}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.completionPercentage !== undefined && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Progress: {task.completionPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created: {new Date(task.createdAt || 0).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Updated: {new Date(task.updatedAt || 0).toLocaleDateString()}</span>
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Assigned to: {task.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {task.recurringConfig?.isRecurring && (
                <>
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Recurring Task Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <RotateCw className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Pattern: Every {task.recurringConfig.interval} {" "}
                          {task.recurringConfig.pattern === "daily" ? "day(s)" : 
                           task.recurringConfig.pattern === "weekly" ? "week(s)" :
                           task.recurringConfig.pattern === "biweekly" ? "2 week(s)" : "month(s)"}
                        </span>
                      </div>
                      
                      {task.recurringConfig.daysOfWeek && task.recurringConfig.daysOfWeek.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            On days: {" "}
                            {task.recurringConfig.daysOfWeek
                              .map(day => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day])
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Next occurrence: {getNextOccurrenceText()}</span>
                      </div>
                      
                      {task.recurringConfig.endAfterOccurrences && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Ends after {task.recurringConfig.endAfterOccurrences} occurrences 
                            (Completed: {task.recurringConfig.occurrencesCompleted || 0})
                          </span>
                        </div>
                      )}
                      
                      {task.recurringConfig.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Ends on: {format(new Date(task.recurringConfig.endDate), "PPP")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="flex-1 overflow-auto p-1">
            <TaskCommentSection task={task} />
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-auto p-1">
            <TaskActivity activities={task.activities} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
