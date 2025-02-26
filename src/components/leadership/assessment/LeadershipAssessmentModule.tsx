
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InitialAssessment } from "./InitialAssessment"
import { AgentSimulation } from "./AgentSimulation"
import { AssessmentResults } from "./AssessmentResults"

export function LeadershipAssessmentModule() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Leadership Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Complete assessments and simulations to advance your leadership journey
          </p>
        </div>

        <Tabs defaultValue="initial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="initial">Initial Assessment</TabsTrigger>
            <TabsTrigger value="simulation">Agent Simulation</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="initial">
            <InitialAssessment />
          </TabsContent>
          <TabsContent value="simulation">
            <AgentSimulation />
          </TabsContent>
          <TabsContent value="results">
            <AssessmentResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
