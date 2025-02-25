
import { Card } from "@/components/ui/card"
import { PerformanceMetrics } from "@/types/performance"

interface AgentMetricsProps {
  metrics: PerformanceMetrics;
}

export function AgentMetrics({ metrics }: AgentMetricsProps) {
  return (
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
  )
}
