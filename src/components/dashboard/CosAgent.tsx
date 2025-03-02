import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Bot, Brain, Users, Target, ClipboardList, Plus, ListChecks } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Agent, Task } from "@/types/task"
import { PerformanceMetrics } from "@/types/performance"
import { AgentMetrics } from "./cos-agent/AgentMetrics"
import { AgentPreferences } from "./cos-agent/AgentPreferences"
import { AgentsList } from "./cos-agent/AgentsList"
import { Recommendations } from "./cos-agent/Recommendations"
import { CreateAgentDialog } from "./cos-agent/CreateAgentDialog"
import { LeadershipSimulation } from "./cos-agent/LeadershipSimulation"
import { useCosData } from "@/hooks/useCosData"
import { useCosRecommendations } from "@/hooks/useCosRecommendations"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { suggestTasks } from "@/utils/tasks/basicOperations"
import { TaskSuggestionDialog } from "./cos-agent/TaskSuggestionDialog"
import { TeamCollaboration } from "./cos-agent/TeamCollaboration"
import { useToast } from "@/hooks/use-toast"

export function CosAgent() {
  const [agents, setAgents] = useState<Agent[]>([])
  const { preferences, agents: fetchedAgents } = useCosData()
  const { recommendations, setRecommendations, handleFeedback } = useCosRecommendations()
  const [deploymentTarget, setDeploymentTarget] = useState<string | null>(null)
  const [suggestedTasks, setSuggestedTasks] = useState<Task[]>([])
  const [taskSuggestionOpen, setTaskSuggestionOpen] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const { currentUser } = useAuth()
  const { toast } = useToast()
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

  const handleGenerateTaskSuggestions = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate task suggestions",
        variant: "destructive"
      })
      return
    }
    
    setIsLoadingSuggestions(true)
    
    try {
      const tasks = await suggestTasks(currentUser.uid)
      setSuggestedTasks(tasks)
      setTaskSuggestionOpen(true)
    } catch (error) {
      console.error("Error generating task suggestions:", error)
      toast({
        title: "Failed to generate suggestions",
        description: "An error occurred while generating task suggestions",
        variant: "destructive"
      })
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleTaskAdded = (taskId: string) => {
    toast({
      title: "Task added",
      description: "The suggested task has been added to your task list"
    })
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
        <TabsList className="grid grid-cols-5 gap-4">
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
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {preferences && <AgentPreferences preferences={preferences} />}
          <AgentMetrics metrics={metrics} />
          <Recommendations 
            recommendations={recommendations}
            onFeedback={handleFeedback}
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
          <TeamCollaboration />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Task Assistance</h4>
            <Button variant="outline" size="sm" onClick={handleGenerateTaskSuggestions} disabled={isLoadingSuggestions}>
              {isLoadingSuggestions ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  <ListChecks className="h-4 w-4 mr-1" /> Generate Tasks
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <Card className="p-4">
              <h5 className="text-sm font-medium mb-2">Task Optimization</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Your CoS agent can analyze your tasks and suggest optimizations 
                to improve your productivity.
              </p>
              <div className="flex justify-end">
                <Button size="sm">Analyze Tasks</Button>
              </div>
            </Card>
            
            <Card className="p-4">
              <h5 className="text-sm font-medium mb-2">Time Estimation</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered time estimates for your tasks based on 
                historical data and task complexity.
              </p>
              <div className="flex justify-end">
                <Button size="sm">Estimate Times</Button>
              </div>
            </Card>
            
            <Card className="p-4">
              <h5 className="text-sm font-medium mb-2">Task Prioritization</h5>
              <p className="text-sm text-muted-foreground mb-4">
                Let your CoS agent help you prioritize your tasks based on 
                deadlines, importance, and your work preferences.
              </p>
              <div className="flex justify-end">
                <Button size="sm">Prioritize Tasks</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <TaskSuggestionDialog
        open={taskSuggestionOpen}
        onOpenChange={setTaskSuggestionOpen}
        suggestedTasks={suggestedTasks}
        onTaskAdded={handleTaskAdded}
      />
    </Card>
  )
}
