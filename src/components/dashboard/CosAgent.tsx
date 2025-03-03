
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Bot, Brain, Users, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Agent } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { AgentMetrics } from "./cos-agent/AgentMetrics"
import { AgentPreferences } from "./cos-agent/AgentPreferences"
import { AgentsList } from "./cos-agent/AgentsList"
import { Recommendations } from "./cos-agent/Recommendations"
import { CreateAgentDialog } from "./cos-agent/CreateAgentDialog"
import { LeadershipSimulation } from "./cos-agent/LeadershipSimulation"
import { useCosData } from "@/hooks/useCosData"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { useNavigate } from "react-router-dom"

export function CosAgent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const { preferences, agents: fetchedAgents } = useCosData()
  const { 
    recommendations, 
    setRecommendations, 
    handleFeedback, 
    handleAction 
  } = useCosRecommendations()
  const navigate = useNavigate()
  const [deploymentTarget, setDeploymentTarget] = useState<string | null>(null)
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

  const handleAgentDeployment = (agentId: string, targetId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          assignedTasks: [...agent.assignedTasks, targetId],
          currentLoad: Math.min(agent.currentLoad + 20, 100),
          status: agent.currentLoad >= 80 ? "overloaded" : "active"
        }
      }
      return agent
    }))
    setDeploymentTarget(null)
  }

  const handleRecommendationAction = (recId: string, actionType: string) => {
    handleAction(recId, actionType)
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Simulation
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {preferences && <AgentPreferences preferences={preferences} />}
          <AgentMetrics metrics={metrics} />
          <h4 className="text-sm font-medium mb-3">Personalized Recommendations</h4>
          <Recommendations 
            recommendations={recommendations}
            onFeedback={handleFeedback}
            onAction={handleRecommendationAction}
          />
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <LeadershipSimulation />
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Active Agents</h4>
            <CreateAgentDialog onAgentCreated={handleAgentCreated} />
          </div>
          <AgentsList 
            agents={agents}
            onDeploy={handleAgentDeployment}
            deploymentTarget={deploymentTarget}
            setDeploymentTarget={setDeploymentTarget}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="text-center p-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 font-semibold">Team Management</h3>
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
