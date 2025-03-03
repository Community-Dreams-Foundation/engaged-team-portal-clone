
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { Task } from "@/types/task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, AlertCircle, CheckCircle, Tag } from "lucide-react"

interface ViewAllTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAllTasksDialog({ open, onOpenChange }: ViewAllTasksDialogProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser?.uid || !open) return
      
      try {
        setLoading(true)
        const fetchedTasks = await fetchTasks(currentUser.uid)
        setTasks(fetchedTasks)
        setFilteredTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Failed to load your tasks. Please try again."
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadTasks()
  }, [currentUser?.uid, open, toast])
  
  useEffect(() => {
    let result = [...tasks]
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
    
    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(task => task.status === activeTab)
    }
    
    setFilteredTasks(result)
  }, [searchQuery, activeTab, tasks])
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleDateString()
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">To Do</Badge>
      case "in-progress":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge variant="outline" className="text-green-500 border-green-500">Completed</Badge>
      case "blocked":
        return <Badge variant="outline" className="text-red-500 border-red-500">Blocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>All Tasks</DialogTitle>
          <DialogDescription>
            View and manage all your tasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <AlertCircle className="h-10 w-10" />
                <p>No tasks found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Estimated</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          {task.priority && (
                            <Badge
                              variant="outline"
                              className={
                                task.priority === 'high'
                                  ? 'text-red-500 border-red-500'
                                  : task.priority === 'medium'
                                  ? 'text-yellow-500 border-yellow-500'
                                  : 'text-green-500 border-green-500'
                              }
                            >
                              {task.priority}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(task.estimatedDuration)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(task.actualDuration)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(task.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {task.tags?.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
