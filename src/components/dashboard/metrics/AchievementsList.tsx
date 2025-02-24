
import { Medal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Achievement } from "@/types/performance"

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Recent Achievements</h4>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement) => (
          <Badge 
            key={achievement.id} 
            variant="outline" 
            className="flex items-center gap-1"
          >
            <Medal className="h-3 w-3" />
            {achievement.title}
          </Badge>
        ))}
      </div>
    </div>
  );
}

