
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Clock, Target } from "lucide-react"
import type { Portfolio } from "@/types/portfolio"

interface ImpactMetricsProps {
  summary: Portfolio["summary"];
}

export function ImpactMetrics({ summary }: ImpactMetricsProps) {
  const stats = [
    {
      icon: Target,
      label: "Projects Completed",
      value: summary.totalProjects,
    },
    {
      icon: Clock,
      label: "Time Saved",
      value: `${summary.overallImpact.timesSaved} mins`,
    },
    {
      icon: Award,
      label: "Efficiency Improvement",
      value: `${summary.overallImpact.efficiencyImprovement}%`,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <stat.icon className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
