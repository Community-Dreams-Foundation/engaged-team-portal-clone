import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentParsingEngine } from "./DocumentParsingEngine";
import { CoSRecommendation, Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface CreateTaskDialogProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Partial<Task>) => void;
  onRecommendationsGenerated?: (recommendations: CoSRecommendation[]) => void;
}

const CreateTaskDialog = ({ 
  open,
  onOpenChange,
  onTaskCreated,
  onRecommendationsGenerated 
}: CreateTaskDialogProps) => {
  const { currentUser } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [extractedTasks, setExtractedTasks] = useState<Partial<Task>[]>([]);

  const dialogOpen = open !== undefined ? open : internalOpen;
  const setDialogOpen = (value: boolean) => {
    if (open !== undefined) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter a task title"
      });
      return;
    }

    const newTask: Partial<Task> = {
      title,
      description,
      estimatedDuration,
      priority,
      status: "todo",
      actualDuration: 0
    };

    onTaskCreated(newTask);
    resetForm();
    setDialogOpen(false);
  };

  const handleTasksExtracted = (tasks: Partial<Task>[]) => {
    setExtractedTasks(tasks);
  };

  const handleRecommendationsGenerated = (recommendations: CoSRecommendation[]) => {
    if (onRecommendationsGenerated) {
      onRecommendationsGenerated(recommendations);
    }
  };

  const handleCreateExtractedTask = (task: Partial<Task>) => {
    onTaskCreated(task);
    
    setExtractedTasks(extractedTasks.filter(t => t.title !== task.title));
    
    toast({
      title: "Task Created",
      description: `Added "${task.title}" to your tasks`
    });
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEstimatedDuration(60);
    setPriority("medium");
    setExtractedTasks([]);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="document">Document Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={180}
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(parseInt(e.target.value, 10))}
                  />
                  <p className="text-xs text-muted-foreground">Maximum 3 hours (180 minutes)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="document" className="mt-4">
            <div className="space-y-4">
              <DocumentParsingEngine
                onTasksExtracted={handleTasksExtracted}
                onRecommendationsGenerated={handleRecommendationsGenerated}
              />
              
              {extractedTasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Extracted Tasks</h3>
                  <div className="border rounded-md divide-y">
                    {extractedTasks.map((task, index) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {task.estimatedDuration} minutes • {task.priority} priority
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleCreateExtractedTask(task)}
                        >
                          Add Task
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
