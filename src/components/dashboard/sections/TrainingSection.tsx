
import { Card } from "@/components/ui/card"
import { TrainingModules } from "@/components/dashboard/TrainingModules"
import { KnowledgeGraph } from "@/components/dashboard/cos-agent/KnowledgeGraph"
import { TeamChallengesBoard } from "@/components/dashboard/gamification/TeamChallengesBoard"
import type { TeamChallenge } from "@/types/gamification"

interface TrainingSectionProps {
  knowledgeData: any;
  challenges: TeamChallenge[];
}

export function TrainingSection({ knowledgeData, challenges }: TrainingSectionProps) {
  return (
    <div className="md:col-span-2 space-y-4">
      <Card className="p-6">
        <TrainingModules />
      </Card>
      <Card className="p-6">
        <KnowledgeGraph data={knowledgeData} />
      </Card>
      <Card className="p-6">
        <TeamChallengesBoard 
          challenges={challenges}
          onJoinChallenge={(id) => console.log("Joining challenge:", id)}
        />
      </Card>
    </div>
  );
}

