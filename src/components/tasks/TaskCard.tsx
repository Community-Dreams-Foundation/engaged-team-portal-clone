
import { Task } from "@/types/task"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Timer, 
  AlertCircle, 
  Lock, 
  Play, 
  Pause, 
  Clock, 
  Tag, 
  Link2, 
  AlertTriangle, 
  GitFork,
  MessageSquare,
  ExternalLink,
  Lightbulb,
  Layers
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { autoSplitTask } from "@/utils/tasks/taskSplitting"
import { useAuth } from "@/contexts/AuthContext"
import { TaskDetailDialog } from "./TaskDetailDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  analyzeTask, 
  breakdownTask, 
  provideTaskGuidance 
} from "@/utils/tasks/taskAnalysisOperations"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TaskCardProps {
  task: Task
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: (taskId: string) => Promise<boolean>
}

export function TaskCard({ task, onTimerToggle, formatDuration, canStartTask }: TaskCardProps) {
  const [canStart, setCanStart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [showBreakdownDialog, setShowBreakdownDialog] = useState(false);
  const [subtasks, setSubtasks] = useState<Array<{title: string, description: string, estimatedDuration: number}>>([
    { title: "", description: "", estimatedDuration: 30 },
    { title: "", description: "", estimatedDuration: 30 }
  ]);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkCanStart = async () => {
      const result = await canStartTask(task.id);
      setCanStart(result);
    };
    checkCanStart();
  }, [task.id, canStartTask]);

  const handleSplitTask = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await autoSplitTask(currentUser.uid, task.id);
      toast({
        title: "Task Split Successfully",
        description: "The task has been split into smaller subtasks",
      });
    } catch (error) {
      console.error("Error splitting task:", error);
      toast({
        variant: "destructive",
        title: "Error splitting task",
        description: "Failed to split the task. Please try again.",
      });
    }
  };

  const handleAnalyzeTask = async () => {
    if (!currentUser?.uid) return;
    
    try {
      // Get task guidance
      const taskGuidance = await provideTaskGuidance(currentUser.uid, task.id);
      setGuidance(taskGuidance);
      
      // Generate recommendations
      await analyzeTask(currentUser.uid, task.id);
      
      setShowAnalysis(true);
      toast({
        title: "Task Analysis Complete",
        description: "Recommendations have been generated for this task",
      });
    } catch (error) {
      console.error("Error analyzing task:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Unable to complete task analysis. Please try again.",
      });
    }
  };

  const handleBreakdown = async () => {
    if (!currentUser?.uid) return;
    
    // Validate subtasks
    const validSubtasks = subtasks.filter(st => st.title.trim() !== "");
    if (validSubtasks.length === 0) {
      toast({
        variant: "destructive",
        title: "Invalid subtasks",
        description: "Please provide at least one valid subtask",
      });
      return;
    }
    
    try {
      await breakdownTask(currentUser.uid, task.id, validSubtasks);
      setShowBreakdownDialog(false);
      toast({
        title: "Task Breakdown Complete",
        description: `Created ${validSubtasks.length} subtasks successfully`,
      });
    } catch (error) {
      console.error("Error breaking down task:", error);
      toast({
        variant: "destructive",
        title: "Breakdown failed",
        description: "Unable to break down task. Please try again.",
      });
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: "", description: "", estimatedDuration: 30 }]);
  };

  const updateSubtask = (index: number, field: string, value: string | number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value };
    setSubtasks(updatedSubtasks);
  };

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

  const shouldRecommendSplit = task.status === "in-progress" && 
    task.totalElapsedTime && task.estimatedDuration &&
    task.totalElapsedTime >= task.estimatedDuration * 60 * 1000 * 0.9 &&
    task.metadata?.autoSplitEligible === true;
    
  const hasComments = task.comments && task.comments.length > 0;
  const commentCount = task.comments?.length || 0;
  const isComplex = task.metadata?.complexity === 'high';

  return (
    <>
      <Card
        key={task.id}
        className="p-3 cursor-move hover:shadow-md transition-shadow"
        draggable
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 
                className="font-medium hover:text-primary cursor-pointer"
                onClick={() => setShowDetails(true)}
              >
                {task.title}
              </h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {getPriorityBadge(task.priority)}
                {task.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {isComplex && (
                  <Badge variant="outline" className="text-purple-500 border-purple-500">
                    Complex
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
              <Link2 className="h-4 w-4" />
              <span>{task.dependencies.length} dependencies</span>
              {!canStart && (
                <Badge variant="secondary" className="ml-auto">
                  Blocked
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Est: {task.estimatedDuration}m
            </span>
            
            {hasComments && (
              <span className="flex items-center gap-1 ml-auto">
                <MessageSquare className="h-4 w-4" />
                {commentCount}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatDuration(task.totalElapsedTime || 0)}
              </span>
              {!canStart && (
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
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleAnalyzeTask}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setShowBreakdownDialog(true)}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Break down task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {shouldRecommendSplit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleSplitTask}
                >
                  <GitFork className="h-4 w-4 mr-1" />
                  Split
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowDetails(true)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onTimerToggle(task.id)}
                disabled={task.status === 'completed' || !canStart}
              >
                {task.isTimerRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <TaskDetailDialog 
        task={task}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Task Analysis
            </DialogTitle>
            <DialogDescription>
              CoS AI analysis for {task.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {guidance && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Guidance:</h4>
                <p>{guidance}</p>
              </div>
            )}
            
            <div className="bg-secondary/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Task Insights:</h4>
              <ul className="space-y-2 list-disc list-inside">
                {task.estimatedDuration > 120 && (
                  <li>This task is time-intensive (over 2 hours)</li>
                )}
                {task.dependencies && task.dependencies.length > 0 && (
                  <li>This task has {task.dependencies.length} dependencies</li>
                )}
                {task.metadata?.complexity === 'high' && (
                  <li>This is a complex task that might benefit from being broken down</li>
                )}
                {task.totalElapsedTime && task.estimatedDuration && 
                  task.totalElapsedTime > task.estimatedDuration * 60 * 1000 * 0.8 && (
                  <li>You've spent {Math.floor((task.totalElapsedTime / (1000 * 60 * task.estimatedDuration)) * 100)}% of the estimated time</li>
                )}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowBreakdownDialog(true)}>
              <Layers className="h-4 w-4 mr-2" />
              Break Down Task
            </Button>
            <Button variant="outline" onClick={() => setShowAnalysis(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakdownDialog} onOpenChange={setShowBreakdownDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Break Down Task
            </DialogTitle>
            <DialogDescription>
              Split "{task.title}" into smaller, manageable subtasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {subtasks.map((subtask, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Subtask {index + 1}</h4>
                </div>
                <Input
                  placeholder="Subtask title"
                  value={subtask.title}
                  onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={subtask.description}
                  onChange={(e) => updateSubtask(index, 'description', e.target.value)}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estimated time (minutes):</span>
                  <Input
                    type="number"
                    min={5}
                    className="w-24"
                    value={subtask.estimatedDuration}
                    onChange={(e) => updateSubtask(index, 'estimatedDuration', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={addSubtask}>
              + Add Another Subtask
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakdownDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBreakdown}>
              Create Subtasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
