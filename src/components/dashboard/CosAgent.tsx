
import { useState } from "react"
import { UserCog, MessageSquare, ArrowUpDown, ListChecks, Loader2 } from "lucide-react"
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
  category: "task" | "meeting" | "reminder"
}

interface ActionItem {
  id: string
  text: string
  completed: boolean
  dueDate?: string
}

// Mock API calls that would normally interact with Gemini
const fetchRecommendations = async (userId: string): Promise<Recommendation[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
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
    },
    {
      id: "3",
      text: "Update project timeline documentation",
      priority: "low",
      category: "task"
    }
  ]
}

const fetchActionItems = async (userId: string): Promise<ActionItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return [
    {
      id: "1",
      text: "Review Q4 strategy document",
      completed: false,
      dueDate: "2024-03-20"
    },
    {
      id: "2",
      text: "Prepare meeting agenda",
      completed: false,
      dueDate: "2024-03-18"
    },
    {
      id: "3",
      text: "Follow up with team leads",
      completed: false,
      dueDate: "2024-03-19"
    }
  ]
}

const simulateAIResponse = async (message: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return "Based on your request, I recommend prioritizing the quarterly review meeting. This aligns with our current focus on performance analysis and will help inform our strategic planning for the next quarter."
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

  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommendations", currentUser?.uid],
    queryFn: () => fetchRecommendations(currentUser?.uid || ""),
    enabled: !!currentUser
  })

  const { data: actionItems = [], refetch: refetchActionItems } = useQuery({
    queryKey: ["actionItems", currentUser?.uid],
    queryFn: () => fetchActionItems(currentUser?.uid || ""),
    enabled: !!currentUser
  })

  const createTaskMutation = useMutation({
    mutationFn: (recommendation: Recommendation) => {
      if (!currentUser?.uid) throw new Error("No user logged in")
      return createTask(currentUser.uid, {
        title: recommendation.text,
        description: `Priority: ${recommendation.priority}`,
        status: "todo",
        estimatedDuration: 60,
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
      const response = await simulateAIResponse(inputMessage)
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

  const toggleActionItem = async (itemId: string) => {
    // In a real implementation, this would update the status in your backend
    await new Promise(resolve => setTimeout(resolve, 500))
    refetchActionItems()
    toast({
      title: "Status updated",
      description: "Action item status has been updated."
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCog className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Chief of Staff Agent</h3>
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
                className="bg-secondary/50 p-2 rounded-md text-sm flex items-center justify-between"
              >
                <span>{recommendation.text}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateTask(recommendation)}
                >
                  Add as Task
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
                <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                  {item.text}
                </span>
                {item.dueDate && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
