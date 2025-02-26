
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor, Brain, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LeadershipMetrics, LeadershipDomain } from "@/types/leadership"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SimulationScenario {
  id: string
  title: string
  description: string
  domain: LeadershipDomain
  difficulty: "beginner" | "intermediate" | "advanced"
  metrics: Partial<LeadershipMetrics>
}

const defaultScenarios: SimulationScenario[] = [
  {
    id: "scenario-1",
    title: "Team Conflict Resolution",
    description: "Handle a conflict between team members while maintaining productivity",
    domain: "team-coordination",
    difficulty: "intermediate",
    metrics: {
      delegationAccuracy: 85,
      teamEfficiency: 75,
      communicationScore: 80
    }
  },
  {
    id: "scenario-2",
    title: "Strategic Decision Making",
    description: "Make critical decisions under time pressure with limited information",
    domain: "strategy",
    difficulty: "advanced",
    metrics: {
      overallScore: 90,
      innovationScore: 85,
      mentorshipScore: 70
    }
  },
]

export function LeadershipSimulation() {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const { toast } = useToast()

  const startSimulation = (scenario: SimulationScenario) => {
    setActiveScenario(scenario)
    setIsSimulating(true)
    toast({
      title: "Simulation Started",
      description: `Starting ${scenario.title} simulation...`
    })
  }

  const completeSimulation = () => {
    if (!activeScenario) return
    
    setIsSimulating(false)
    toast({
      title: "Simulation Completed",
      description: "Your performance data has been recorded."
    })
    setActiveScenario(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leadership Simulation</h2>
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          <span>Real-time Assessment</span>
        </div>
      </div>

      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          {defaultScenarios.map((scenario) => (
            <Card key={scenario.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{scenario.title}</h3>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{scenario.domain}</Badge>
                    <Badge variant="outline">{scenario.difficulty}</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => startSimulation(scenario)}
                  disabled={isSimulating}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="p-4">
            {activeScenario ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Current Simulation Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(activeScenario.metrics).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{key}</p>
                      <p className="text-lg font-semibold">{value}%</p>
                    </div>
                  ))}
                </div>
                <Button onClick={completeSimulation} className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Simulation
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No active simulation</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">AI-Driven Insights</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Real-time AI analysis of your leadership performance will appear here during simulations.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
