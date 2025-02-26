
import { Trophy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  return (
    <Alert variant="default">
      <Trophy className="h-4 w-4" />
      <AlertTitle>Achievements</AlertTitle>
      <AlertDescription className="space-x-2">
        {achievements
          .filter(achievement => achievement.earned)
          .map(achievement => (
            <span key={achievement.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {achievement.name}
            </span>
          ))}
      </AlertDescription>
    </Alert>
  )
}

