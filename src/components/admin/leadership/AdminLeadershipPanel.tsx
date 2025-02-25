
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp } from "lucide-react"

export function AdminLeadershipPanel() {
  const { data: leadershipData, isLoading } = useQuery({
    queryKey: ["leadership-overview"],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return {
        currentLeaders: 8,
        potentialPromotions: 3,
        leadershipCandidates: [
          {
            id: "1",
            name: "Alex Chen",
            readinessScore: 92,
            trainingComplete: true,
            taskEfficiency: 95,
          },
          {
            id: "2",
            name: "Sarah Johnson",
            readinessScore: 88,
            trainingComplete: true,
            taskEfficiency: 87,
          },
        ],
      }
    },
  })

  if (isLoading) return <div>Loading leadership data...</div>

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leadership Development</CardTitle>
            <CardDescription>
              Monitor leader progression and promotion candidates
            </CardDescription>
          </div>
          <Button>
            <Award className="mr-2 h-4 w-4" />
            Promote Member
          </Button>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Current Leaders
                </div>
                <div className="text-2xl font-bold">{leadershipData?.currentLeaders}</div>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Potential Promotions
                </div>
                <div className="text-2xl font-bold">
                  {leadershipData?.potentialPromotions}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Leadership Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadershipData?.leadershipCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="font-medium">{candidate.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Readiness Score: {candidate.readinessScore}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {candidate.trainingComplete && (
                    <Badge variant="secondary">Training Complete</Badge>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
