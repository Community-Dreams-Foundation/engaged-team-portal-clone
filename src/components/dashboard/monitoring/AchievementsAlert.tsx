
import { Trophy, Star, Award } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface Achievement {
  id: string
  name: string
  earned: boolean
  description: string
}

interface AchievementsAlertProps {
  achievements: Achievement[]
}

export function AchievementsAlert({ achievements }: AchievementsAlertProps) {
  const [showAll, setShowAll] = useState(false)
  const earnedAchievements = achievements.filter(achievement => achievement.earned)

  return (
    <Alert variant="default" className="relative">
      <Trophy className="h-5 w-5 text-primary" />
      <AlertTitle className="text-lg font-semibold mb-2">Leadership Achievements</AlertTitle>
      <AlertDescription className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {earnedAchievements.slice(0, showAll ? undefined : 3).map(achievement => (
            <Badge 
              key={achievement.id} 
              variant="secondary"
              className="inline-flex items-center gap-1 px-3 py-1 text-sm"
            >
              <Award className="h-3 w-3" />
              {achievement.name}
            </Badge>
          ))}
        </div>
        
        {earnedAchievements.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary/80"
          >
            {showAll ? 'Show Less' : `Show ${earnedAchievements.length - 3} More`}
          </Button>
        )}

        <Card className="mt-4 p-4 bg-accent/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{earnedAchievements.length} achievements earned</span>
          </div>
        </Card>
      </AlertDescription>
    </Alert>
  )
}
