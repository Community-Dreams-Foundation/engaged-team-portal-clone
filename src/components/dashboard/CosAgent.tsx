
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get, update } from "firebase/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Agent, AgentType, CoSRecommendation } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { CoSPreferences } from "@/types/agent"
import { AgentMetrics } from "./cos-agent/AgentMetrics"
import { AgentPreferences } from "./cos-agent/AgentPreferences"
import { AgentsList } from "./cos-agent/AgentsList"
import { Recommendations } from "./cos-agent/Recommendations"

const defaultPreferences: CoSPreferences = {
  tone: "casual",
  notificationFrequency: "medium",
  trainingFocus: ["time-management", "leadership", "delegation"],
  workloadThreshold: 40,
  delegationPreference: "balanced",
  communicationStyle: "casual",
  agentInteractionLevel: "medium"
}

export function CosAgent() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
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
  })
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
        {preferences && <AgentPreferences preferences={preferences} />}

        <AgentMetrics metrics={metrics} />

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
          <AgentsList agents={agents} />
        </div>

        <Recommendations 
          recommendations={recommendations}
          onFeedback={handleFeedback}
        />
      </div>
    </Card>
  )
}
