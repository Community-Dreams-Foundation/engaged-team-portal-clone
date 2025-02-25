import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bot,
  ThumbsUp,
  ThumbsDown,
  Timer,
  BrainCircuit,
  ChevronRight,
  Plus,
  Activity,
  Trophy,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get, update } from "firebase/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Agent, AgentType, CoSRecommendation, Task } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"

interface CoSPreferences {
  tone: "formal" | "casual"
  notificationFrequency: "high" | "medium" | "low"
  trainingFocus: string[]
  workloadThreshold: number // hours per week
  delegationPreference: "aggressive" | "balanced" | "conservative"
  communicationStyle: "formal" | "casual"
  agentInteractionLevel: "high" | "medium" | "low"
}

const defaultPreferences: CoSPreferences = {
  tone: "casual",
  notificationFrequency: "medium",
  trainingFocus: ["time-management", "leadership", "delegation"],
  workloadThreshold: 40,
  delegationPreference: "balanced",
  communicationStyle: "casual",
  agentInteractionLevel: "medium"
}

const mockRecommendations: CoSRecommendation[] = [
  {
    id: "rec1",
    type: "agent",
    content: "Workload threshold exceeded. Consider creating a Technical Documentation Agent to handle API documentation tasks.",
    timestamp: Date.now() - 1800000,
    priority: "high",
    impact: 85
  },
  {
    id: "rec2",
    type: "task",
    content: "Delegate the API documentation task to maximize efficiency. Current workload indicates potential overallocation.",
    timestamp: Date.now() - 3600000,
    priority: "medium",
    impact: 70
  },
  {
    id: "rec3",
    type: "time",
    content: "Your peak productivity hours are between 9 AM and 11 AM. Schedule complex tasks during this time.",
    timestamp: Date.now() - 7200000,
    priority: "medium",
    impact: 65
  },
  {
    id: "rec4",
    type: "leadership",
    content: "Great job on recent task delegation! Consider mentoring team members on your approach.",
    timestamp: Date.now() - 10800000,
    priority: "low",
    impact: 50
  }
]

const mockPerformanceMetrics: PerformanceMetrics = {
  taskCompletionRate: 0.85,
  avgTaskTime: 45,
  delegationEfficiency: 0.78,
  feedbackScore: 92,
  efficiency: 92,
  totalTasks: 150,
  tasksThisWeek: 25,
  averageTaskTime: 45,
  level: 5,
  experience: 2500,
  experienceToNextLevel: 5000,
  leaderboardRank: 12,
  totalParticipants: 100,
  achievements: [
    {
      id: "first-milestone",
      title: "First Milestone",
      description: "Completed first 10 tasks",
      icon: "trophy",
      earnedAt: Date.now()
    }
  ],
  goals: [],
  weeklyTasks: [
    { name: "Mon", tasks: 5 },
    { name: "Tue", tasks: 7 },
    { name: "Wed", tasks: 4 },
    { name: "Thu", tasks: 6 },
    { name: "Fri", tasks: 3 }
  ],
  feedback: [],
  portfolioAnalytics: {
    views: [],
    uniqueVisitors: 0,
    sectionEngagement: [],
    platformPerformance: {
      linkedin: {
        shares: 0,
        clicks: 0,
        impressions: 0
      },
      github: {
        stars: 0,
        forks: 0,
        views: 0
      }
    },
    clickThroughRate: 0
  }
}

export function CosAgent() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>(mockPerformanceMetrics)
  const [agents, setAgents] = useState<Agent[]>([])
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>("general")
  
  const { data: preferences } = useQuery({
    queryKey: ['cosPreferences', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return defaultPreferences
      const db = getDatabase()
      const prefsRef = ref(db, `users/${currentUser.uid}/cosPreferences`)
      const snapshot = await get(prefsRef)
      return snapshot.exists() ? snapshot.val() : defaultPreferences
    },
    enabled: !!currentUser
  })

  const { data: userAgents } = useQuery({
    queryKey: ['agents', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return []
      const db = getDatabase()
      const agentsRef = ref(db, `users/${currentUser.uid}/agents`)
      const snapshot = await get(agentsRef)
      return snapshot.exists() ? Object.values(snapshot.val()) : []
    },
    enabled: !!currentUser
  })

  useEffect(() => {
    if (userAgents) {
      setAgents(userAgents as Agent[])
    }
  }, [userAgents])

  const handleCreateAgent = async () => {
    if (!currentUser) return

    try {
      const db = getDatabase()
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        type: selectedAgentType,
        name: `${selectedAgentType.charAt(0).toUpperCase() + selectedAgentType.slice(1)} Agent`,
        skills: [],
        currentLoad: 0,
        assignedTasks: [],
        performance: {
          successRate: 100,
          averageTaskTime: 0,
          tasksCompleted: 0
        },
        createdAt: Date.now(),
        lastActive: Date.now(),
        status: "active",
        specializationScore: {}
      }

      await update(ref(db, `users/${currentUser.uid}/agents/${newAgent.id}`), newAgent)
      
      setAgents(prev => [...prev, newAgent])
      setShowCreateAgent(false)
      
      toast({
        title: "Agent Created",
        description: `New ${selectedAgentType} agent has been created successfully!`,
      })
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create agent. Please try again.",
      })
    }
  }

  const handleFeedback = async (recId: string, feedback: "positive" | "negative") => {
    if (!currentUser) return

    try {
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === recId ? { ...rec, feedback } : rec
        )
      )

      setMetrics(prev => ({
        ...prev,
        feedbackScore: feedback === "positive" ? prev.feedbackScore + 1 : prev.feedbackScore - 1
      }))

      const db = getDatabase()
      await update(ref(db, `users/${currentUser.uid}/recommendations/${recId}`), {
        feedback,
        feedbackTimestamp: Date.now()
      })

      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping improve your CoS Agent!",
      })
    } catch (error) {
      console.error("Error saving feedback:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save feedback. Please try again."
      })
    }
  }

  const getRecommendationIcon = (type: CoSRecommendation["type"]) => {
    switch (type) {
      case "task":
        return <Timer className="h-4 w-4 text-blue-500" />
      case "time":
        return <BrainCircuit className="h-4 w-4 text-green-500" />
      case "leadership":
        return <ChevronRight className="h-4 w-4 text-purple-500" />
      case "agent":
        return <Bot className="h-4 w-4 text-orange-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">CoS Agent</h3>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          Active
        </Badge>
      </div>

      <div className="space-y-4">
        {preferences && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">
              {preferences.tone === "formal" ? "Formal Tone" : "Casual Tone"}
            </Badge>
            <Badge variant="outline">
              {preferences.notificationFrequency} notifications
            </Badge>
            <Badge variant="outline">
              {preferences.delegationPreference} delegation
            </Badge>
            <Badge variant="outline">
              {preferences.agentInteractionLevel} interaction
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Task Completion</p>
            <p className="text-lg font-semibold">{(metrics.taskCompletionRate * 100).toFixed(0)}%</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Avg Task Time</p>
            <p className="text-lg font-semibold">{metrics.avgTaskTime} min</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Delegation Score</p>
            <p className="text-lg font-semibold">{(metrics.delegationEfficiency * 100).toFixed(0)}%</p>
          </Card>
          <Card className="p-3">
            <p className="text-sm text-muted-foreground">Feedback Score</p>
            <p className="text-lg font-semibold">{metrics.feedbackScore}</p>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Active Agents</h4>
            <Dialog open={showCreateAgent} onOpenChange={setShowCreateAgent}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {["general", "data-analysis", "content-creation", "project-management"].map((type) => (
                      <Button
                        key={type}
                        variant={selectedAgentType === type ? "default" : "outline"}
                        onClick={() => setSelectedAgentType(type as AgentType)}
                      >
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleCreateAgent} className="w-full">
                    Create Agent
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-medium">{agent.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {agent.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary">
                    {agent.assignedTasks.length} tasks
                  </Badge>
                </div>
                <Progress value={agent.currentLoad} className="mt-2" />
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {(agent.performance.successRate * 100).toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {agent.performance.averageTaskTime}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {agent.performance.tasksCompleted} completed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="p-4 relative group">
              <div className="flex gap-3">
                {getRecommendationIcon(rec.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    {rec.impact && (
                      <Badge variant="outline">
                        Impact: {rec.impact}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{rec.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleFeedback(rec.id, "positive")}
                      disabled={rec.feedback === "positive"}
                    >
                      <ThumbsUp className={`h-4 w-4 ${
                        rec.feedback === "positive" ? "text-green-500" : ""
                      }`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleFeedback(rec.id, "negative")}
                      disabled={rec.feedback === "negative"}
                    >
                      <ThumbsDown className={`h-4 w-4 ${
                        rec.feedback === "negative" ? "text-red-500" : ""
                      }`} />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
}
