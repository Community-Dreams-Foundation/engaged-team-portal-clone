
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex flex-wrap gap-2">
              {item.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {item.projectHighlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
