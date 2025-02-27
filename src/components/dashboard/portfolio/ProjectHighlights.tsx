
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, ChevronUp } from "lucide-react"
import type { PortfolioItem } from "@/types/portfolio"

interface ProjectHighlightsProps {
  items: PortfolioItem[];
}

export function ProjectHighlights({ items }: ProjectHighlightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="space-y-4 p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <div className="flex items-center gap-2">
                <ChevronUp className="text-green-500 h-4 w-4" />
                <span className="text-sm font-medium text-green-500">
                  {item.impact.efficiency}% efficiency
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">{item.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Impact Score</span>
                <span className="font-medium">{item.impact.timeEfficiency}%</span>
              </div>
              <Progress value={item.impact.timeEfficiency} className="h-2" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {item.achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Achievements</h4>
                <div className="space-y-1">
                  {item.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {item.projectHighlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Project Impact</h4>
                <ul className="list-disc list-inside space-y-1">
                  {item.projectHighlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
