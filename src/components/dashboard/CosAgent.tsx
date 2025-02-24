
import { useState, useEffect } from "react"
import { UserCog, MessageSquare, ArrowUpDown, ListChecks, Loader2, Settings, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { createTask } from "@/utils/taskUtils"

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: number
}

interface Recommendation {
  id: string
  text: string
  priority: "high" | "medium" | "low"
  category: "task" | "meeting" | "reminder" | "agent_creation"
  agentType?: string
  workload?: number
}

interface ActionItem {
  id: string
  text: string
  completed: boolean
  dueDate?: string
  priority: "high" | "medium" | "low"
}

interface AgentPreferences {
  communicationStyle: "formal" | "casual"
  taskPrioritization: "deadline" | "importance"
  notificationFrequency: "high" | "medium" | "low"
}

// Mock API calls
const fetchRecommendations = async (userId: string): Promise<Recommendation[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const workload = Math.random() * 100 // Simulate workload percentage
  
  const recommendations: Recommendation[] = [
    {
      id: "1",
      text: "Review the quarterly performance metrics",
      priority: "high",
      category: "task"
    },
    {
      id: "2",
      text: "Schedule team sync for project updates",
      priority: "medium",
      category: "meeting"
    }
  ]

  // Add agent creation recommendation if workload is high
  if (workload > 75) {
    recommendations.push({
      id: "3",
      text: `Current workload is at ${Math.round(workload)}%. Consider creating a Data Analysis Agent to help manage the increasing task load.`,
      priority: "high",
      category: "agent_creation",
      agentType: "data_analysis",
      workload
    })
  }

  return recommendations
}

const fetchActionItems = async (userId: string): Promise<ActionItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return [
    {
      id: "1",
      text: "Review Q4 strategy document",
      completed: false,
      dueDate: "2024-03-20",
      priority: "high"
    },
    {
      id: "2",
      text: "Prepare meeting agenda",
      completed: false,
      dueDate: "2024-03-18",
      priority: "medium"
    }
  ]
}

const simulateAIResponse = async (message: string, preferences: AgentPreferences): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Adapt response based on communication style preference
  const style = preferences.communicationStyle === "formal" 
    ? "Based on the current analysis," 
    : "Hey! Looking at things,"

  return `${style} I recommend prioritizing the quarterly review meeting. This aligns with our focus on performance analysis and will help inform our strategic planning for the next quarter.`
}

const fetchAgentPreferences = async (userId: string): Promise<AgentPreferences> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    communicationStyle: "formal",
    taskPrioritization: "deadline",
    notificationFrequency: "medium"
  }
}

export function CosAgent() {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "How can I assist you today?",
      timestamp: Date.now()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [preferences, setPreferences] = useState<AgentPreferences>({
    communicationStyle: "formal",
    taskPrioritization: "deadline",
    notificationFrequency: "medium"
  })

  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommendations", currentUser?.uid],
    queryFn: () => fetchRecommendations(currentUser?.uid || ""),
    enabled: !!currentUser,
    refetchInterval: 30000 // Refresh every 30 seconds to check workload
  })

  const { data: actionItems = [], refetch: refetchActionItems } = useQuery({
    queryKey: ["actionItems", currentUser?.uid],
    queryFn: () => fetchActionItems(currentUser?.uid || ""),
    enabled: !!currentUser
  })

  useEffect(() => {
    if (currentUser?.uid) {
      fetchAgentPreferences(currentUser.uid).then(prefs => setPreferences(prefs))
    }
  }, [currentUser?.uid])

  const createTaskMutation = useMutation({
    mutationFn: (recommendation: Recommendation) => {
      if (!currentUser?.uid) throw new Error("No user logged in")
      return createTask(currentUser.uid, {
        title: recommendation.text,
        description: `Priority: ${recommendation.priority}`,
        status: "todo",
        estimatedDuration: 60,
        actualDuration: 0,
        dependencies: [],
        isTimerRunning: false,
        startTime: undefined,
        totalElapsedTime: 0
      })
    },
    onSuccess: () => {
      toast({
        title: "Task created",
        description: "The recommendation has been added to your task board."
      })
    },
    onError: (error) => {
      console.error("Error creating task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task. Please try again."
      })
    }
  })

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsProcessing(true)

    try {
      const response = await simulateAIResponse(inputMessage, preferences)
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your message. Please try again."
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateTask = (recommendation: Recommendation) => {
    createTaskMutation.mutate(recommendation)
  }

  const handleCreateAgent = (agentType: string, workload: number) => {
    toast({
      title: "New Agent Requested",
      description: `Creating a new ${agentType} agent to handle ${Math.round(workload)}% workload.`
    })
    // In real implementation, this would call the API to create a new agent
  }

  const toggleActionItem = async (itemId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    refetchActionItems()
    toast({
      title: "Status updated",
      description: "Action item status has been updated."
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Chief of Staff Agent</h3>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto space-y-3">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start gap-2">
              {message.role === "assistant" ? (
                <UserCog className="h-4 w-4 mt-1 text-primary" />
              ) : (
                <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
              )}
              <p className={`text-sm ${message.role === "user" ? "text-muted-foreground" : ""}`}>
                {message.content}
              </p>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className="resize-none"
          />
          <Button 
            className="flex-shrink-0" 
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Recommendations</h4>
            </div>
          </div>
          <div className="space-y-2">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`bg-secondary/50 p-2 rounded-md text-sm flex items-center justify-between ${
                  recommendation.priority === "high" ? "border-l-4 border-red-500" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {recommendation.category === "agent_creation" && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>{recommendation.text}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => 
                    recommendation.category === "agent_creation" && recommendation.agentType && recommendation.workload
                      ? handleCreateAgent(recommendation.agentType, recommendation.workload)
                      : handleCreateTask(recommendation)
                  }
                >
                  {recommendation.category === "agent_creation" ? "Create Agent" : "Add as Task"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Action Items</h4>
          </div>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleActionItem(item.id)}
                />
                <div className="flex-1">
                  <span className={`${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.text}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Due: {new Date(item.dueDate || "").toLocaleDateString()}</span>
                    <span className={`px-1.5 py-0.5 rounded-full ${
                      item.priority === "high" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
