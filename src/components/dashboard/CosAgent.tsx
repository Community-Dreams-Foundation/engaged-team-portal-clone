
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { AgentMetrics } from "./cos-agent/AgentMetrics"
import { AgentPreferences } from "./cos-agent/AgentPreferences"
import { AgentsList } from "./cos-agent/AgentsList"
import { Recommendations } from "./cos-agent/Recommendations"
import { CreateAgentDialog } from "./cos-agent/CreateAgentDialog"
import { useCosData } from "@/hooks/useCosData"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"

export function CosAgent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const { preferences, agents: fetchedAgents } = useCosData()
  const { recommendations, setRecommendations, handleFeedback } = useCosRecommendations()
  const [metrics] = useState<PerformanceMetrics>({
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

  useEffect(() => {
    if (fetchedAgents) {
      setAgents(fetchedAgents)
    }
  }, [fetchedAgents])

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [...prev, newAgent])
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
            <CreateAgentDialog onAgentCreated={handleAgentCreated} />
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
