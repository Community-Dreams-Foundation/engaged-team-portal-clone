import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LeadershipDomain } from "@/types/leadership"

type SimulationScenario = {
  id: string
  title: string
  description: string
  domain: LeadershipDomain
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number // in minutes
  completed?: boolean
  progress?: number
}

const SAMPLE_SCENARIOS: SimulationScenario[] = [
  {
    id: "scenario-1",
    title: "Team Conflict Resolution",
    description: "Navigate a complex conflict between team members with different working styles.",
    domain: "engagement",
    difficulty: "intermediate",
    estimatedDuration: 20,
    progress: 0
  },
  {
    id: "scenario-2",
    title: "Strategic Planning Session",
    description: "Lead a strategic planning session to define quarterly objectives.",
    domain: "strategy",
    difficulty: "advanced",
    estimatedDuration: 30,
    progress: 0
  },
  {
    id: "scenario-3",
    title: "Resource Allocation",
    description: "Optimize resource allocation across multiple concurrent projects.",
    domain: "product-design",
    difficulty: "intermediate",
    estimatedDuration: 25,
    progress: 0
  }
]

export function LeadershipSimulation() {
  const [selectedDomain, setSelectedDomain] = useState<LeadershipDomain>("strategy")
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(SAMPLE_SCENARIOS)

  const filteredScenarios = selectedDomain === "strategy" 
    ? scenarios 
    : scenarios.filter(s => s.domain === selectedDomain)

  const startScenario = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => {
      if (s.id === scenarioId) {
        return { ...s, progress: 0 }
      }
      return s
    }))
    // TODO: Implement actual simulation logic
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Leadership Simulation</h3>
        <Select
          value={selectedDomain}
          onValueChange={(value: LeadershipDomain) => setSelectedDomain(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="product-design">Product Design</SelectItem>
            <SelectItem value="data-engineering">Data Engineering</SelectItem>
            <SelectItem value="software-development">Software Development</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{scenario.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{scenario.difficulty}</Badge>
                  <Badge variant="outline">{scenario.estimatedDuration} min</Badge>
                  <Badge variant="outline">{scenario.domain}</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => startScenario(scenario.id)}
                disabled={scenario.completed}
              >
                {scenario.completed ? "Completed" : "Start Simulation"}
              </Button>
            </div>
            {typeof scenario.progress === "number" && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{scenario.progress}%</span>
                </div>
                <Progress value={scenario.progress} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
