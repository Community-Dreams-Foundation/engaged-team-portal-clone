
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Clock, Target, TrendingUp } from "lucide-react"
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
      progress: (summary.totalProjects / 10) * 100, // Assuming 10 is a good baseline
    },
    {
      icon: Clock,
      label: "Time Saved",
      value: `${Math.round(summary.overallImpact.timesSaved / 60)}h`,
      progress: Math.min((summary.overallImpact.timesSaved / 3600) * 100, 100),
    },
    {
      icon: TrendingUp,
      label: "Efficiency Improvement",
      value: `${summary.overallImpact.efficiencyImprovement}%`,
      progress: summary.overallImpact.efficiencyImprovement,
    },
    {
      icon: Award,
      label: "Top Skills",
      value: summary.topSkills.length,
      progress: (summary.topSkills.length / 5) * 100, // Assuming 5 skills is a good baseline
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-4 rounded-lg border p-4"
            >
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
              <Progress value={stat.progress} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
