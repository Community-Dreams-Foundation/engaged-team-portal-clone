
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Timer, BrainCircuit, ChevronRight, Bot } from "lucide-react"
import type { CoSRecommendation } from "@/types/task"

interface RecommendationsProps {
  recommendations: CoSRecommendation[];
  onFeedback: (recId: string, feedback: "positive" | "negative") => void;
}

export function Recommendations({ recommendations, onFeedback }: RecommendationsProps) {
  const getRecommendationIcon = (type: CoSRecommendation["type"]) => {
    switch (type) {
      case "task":
        return <Timer className="h-4 w-4 text-blue-500" />
      case "time":
        return <BrainCircuit className="h-4 w-4 text-green-500" />
      case "leadership":
        return <ChevronRight className="h-4 w-4 text-purple-500" />
      case "agent":
        return <Bot className="h-4 w-4 text-orange-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <Card key={rec.id} className="p-4 relative group">
          <div className="flex gap-3">
            {getRecommendationIcon(rec.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                  {rec.priority}
                </Badge>
                {rec.impact && (
                  <Badge variant="outline">
                    Impact: {rec.impact}%
                  </Badge>
                )}
              </div>
              <p className="text-sm">{rec.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onFeedback(rec.id, "positive")}
                  disabled={rec.feedback === "positive"}
                >
                  <ThumbsUp className={`h-4 w-4 ${
                    rec.feedback === "positive" ? "text-green-500" : ""
                  }`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onFeedback(rec.id, "negative")}
                  disabled={rec.feedback === "negative"}
                >
                  <ThumbsDown className={`h-4 w-4 ${
                    rec.feedback === "negative" ? "text-red-500" : ""
                  }`} />
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(rec.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
