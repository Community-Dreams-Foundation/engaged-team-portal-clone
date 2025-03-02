import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Users, MessageSquare, Share2, 
  Calendar, AlertCircle, Check, X,
  BrainCircuit, PlusCircle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Task } from "@/types/task"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createTeamTask } from "@/utils/tasks/basicOperations"
import { useAuth } from "@/contexts/AuthContext"

// Mock team members data
const TEAM_MEMBERS = [
  {
    id: "user-1",
    name: "Alice Cooper",
    avatar: "/placeholder.svg",
    role: "Designer",
    skills: ["UI/UX", "Figma", "Wireframing"],
    availability: "High",
    status: "online"
  },
  {
    id: "user-2",
    name: "Bob Johnson",
    avatar: "/placeholder.svg",
    role: "Developer",
    skills: ["React", "Node.js", "TypeScript"],
    availability: "Medium",
    status: "away"
  },
  {
    id: "user-3",
    name: "Charlie Smith",
    avatar: "/placeholder.svg",
    role: "Project Manager",
    skills: ["Agile", "Scrum", "Requirements"],
    availability: "Low",
    status: "offline"
  }
];

// Mock shared tasks
const SHARED_TASKS: Task[] = [
  {
    id: "shared-task-1",
    title: "Quarterly planning session",
    description: "Prepare and conduct Q2 planning session",
    status: "in-progress",
    estimatedDuration: 120,
    actualDuration: 60,
    assignedTo: "team",
    metadata: {
      complexity: "medium",
      impact: "medium",
      businessValue: 7,
      learningOpportunity: 5,
      sharedTask: true,
      teamMembers: ["user-1", "user-2", "user-3"]
    }
  },
  {
    id: "shared-task-2",
    title: "Design review",
    description: "Review new feature designs with the team",
    status: "not-started",
    estimatedDuration: 60,
    actualDuration: 0,
    assignedTo: "team",
    metadata: {
      complexity: "low",
      impact: "medium",
      businessValue: 6,
      learningOpportunity: 4,
      sharedTask: true,
      teamMembers: ["user-1", "user-3"]
    }
  }
];

export function TeamCollaboration() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const handleShareTask = async () => {
    if (!currentUser) return
    
    if (!taskTitle) {
      toast({
        title: "Task title required",
        description: "Please enter a title for the task",
        variant: "destructive"
      })
      return
    }
    
    if (selectedMembers.length === 0) {
      toast({
        title: "Select team members",
        description: "Please select at least one team member to share with",
        variant: "destructive"
      })
      return
    }
    
    setIsSharing(true)
    
    try {
      // Create a shared task
      await createTeamTask(
        currentUser.uid,
        {
          title: taskTitle,
          description: taskDescription,
          status: "not-started",
          estimatedDuration: 60, // Default 1 hour
          actualDuration: 0,
          tags: ["team", "collaboration"]
        },
        selectedMembers
      )
      
      toast({
        title: "Task shared successfully",
        description: `Shared with ${selectedMembers.length} team member(s)`
      })
      
      // Reset form
      setTaskTitle("")
      setTaskDescription("")
      setSelectedMembers([])
      setShareDialogOpen(false)
    } catch (error) {
      console.error("Error sharing task:", error)
      toast({
        title: "Failed to share task",
        description: "An error occurred while sharing the task",
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(current => 
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId]
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center">
            <Users className="h-5 w-5 text-primary mr-2" />
            Team Collaboration
          </CardTitle>
          <Popover open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="h-8">
                <Share2 className="h-4 w-4 mr-1" />
                Share Task
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Share Task with Team</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Task title"
                    className="w-full px-3 py-2 border rounded-md"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Task description (optional)"
                    className="w-full px-3 py-2 border rounded-md h-20"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Select team members:</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {TEAM_MEMBERS.map(member => (
                      <div 
                        key={member.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border ${
                          selectedMembers.includes(member.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:bg-muted'
                        }`}
                        onClick={() => toggleMemberSelection(member.id)}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                        </div>
                        {selectedMembers.includes(member.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShareDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleShareTask}
                    disabled={isSharing || !taskTitle || selectedMembers.length === 0}
                  >
                    {isSharing ? 'Sharing...' : 'Share'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="team">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="shared-tasks">Shared Tasks</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="mt-4 space-y-4">
            {TEAM_MEMBERS.map(member => (
              <div 
                key={member.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-sm">{member.name}</h4>
                      <div 
                        className={`ml-2 h-2 w-2 rounded-full ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3 mt-3">
              <Button variant="outline" className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="shared-tasks" className="mt-4 space-y-3">
            {SHARED_TASKS.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No shared tasks</p>
              </div>
            ) : (
              SHARED_TASKS.map(task => (
                <Card key={task.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      
                      <div className="flex mt-2 gap-2">
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {task.status}
                        </Badge>
                        
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {(task.metadata?.teamMembers as string[])?.length || 0} members
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
            
            <div className="border-t pt-3 mt-3">
              <Button variant="outline" className="w-full" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share New Task
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="meetings" className="mt-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <h4 className="font-medium mb-2">No upcoming meetings</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a meeting with your team members
                </p>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
