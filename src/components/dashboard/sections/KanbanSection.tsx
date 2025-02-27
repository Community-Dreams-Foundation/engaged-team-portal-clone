
import { Card } from "@/components/ui/card"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"

export function KanbanSection() {
  return (
    <div className="col-span-full">
      <Card className="p-6">
        <KanbanBoard />
      </Card>
    </div>
  );
}

