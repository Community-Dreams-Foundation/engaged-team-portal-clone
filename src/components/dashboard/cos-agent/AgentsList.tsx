
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Trophy, Timer, Activity, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Agent } from "@/types/task"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, update, get } from "firebase/database"

interface AgentsListProps {
  agents: Agent[];
}

export function AgentsList({ agents }: AgentsListProps) {
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const calculateAgentMatch = (agent: Agent, taskDomain: string) => {
    // Calculate match score based on specialization and current workload
    const specializationScore = agent.specializationScore[taskDomain] || 0
    const workloadFactor = 1 - (agent.currentLoad / 100)
    return specializationScore * workloadFactor
  }

  const findBestAgent = async (taskDomain: string) => {
    if (!agents.length) return null

    const availableAgents = agents.filter(agent => 
      agent.status !== "inactive" && agent.currentLoad < 80
    )

    if (!availableAgents.length) return null

    const agentScores = availableAgents.map(agent => ({
      agent,
      score: calculateAgentMatch(agent, taskDomain)
    }))

    return agentScores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).agent
  }

  const handleDelegateTask = async (agent: Agent) => {
    if (!currentUser?.uid) return
    
    if (agent.currentLoad >= 80) {
      toast({
        title: "Agent Overloaded",
        description: "This agent's workload is too high. Consider delegating to another agent.",
        variant: "destructive"
      })
      return
    }

    try {
      const db = getDatabase()
      const agentRef = ref(db, `users/${currentUser.uid}/agents/${agent.id}`)
      const delegationHistoryRef = ref(db, `users/${currentUser.uid}/delegationHistory/${Date.now()}`)
      
      // Calculate new load based on current tasks
      const newLoad = Math.min(agent.currentLoad + 20, 100)
      
      // Update agent data
      await update(agentRef, {
        currentLoad: newLoad,
        lastActive: Date.now(),
        status: newLoad >= 80 ? "overloaded" : "active"
      })

      // Record delegation history
      await update(delegationHistoryRef, {
        agentId: agent.id,
        agentName: agent.name,
        timestamp: Date.now(),
        workloadBefore: agent.currentLoad,
        workloadAfter: newLoad,
        type: "manual_delegation"
      })

      toast({
        title: "Task Delegated",
        description: `Task successfully assigned to ${agent.name}`,
      })
    } catch (error) {
      console.error("Error delegating task:", error)
      toast({
        title: "Delegation Failed",
        description: "Failed to delegate task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "overloaded":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-medium">{agent.name}</span>
              <div className="flex items-center gap-2">
                <span 
                  className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}
                />
                <Badge variant="outline">
                  {agent.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelegateTask(agent)}
              disabled={agent.status === "inactive" || agent.status === "overloaded"}
              className="ml-2"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Delegate
            </Button>
          </div>
          
          <Progress 
            value={agent.currentLoad} 
            className={`mt-2 ${agent.currentLoad > 80 ? "[--progress-background:hsl(var(--destructive))]" : ""}`}
          />
          
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

          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Specializations: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(agent.specializationScore || {}).map(([domain, score]) => (
                score > 0 && (
                  <Badge key={domain} variant="secondary" className="text-xs">
                    {domain}: {score}%
                  </Badge>
                )
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
