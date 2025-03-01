
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { ChevronRight } from "lucide-react"

export function KanbanSection() {
  return (
    <div className="col-span-full">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              Tasks Dashboard
            </CardTitle>
            <button className="text-sm text-primary hover:underline flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <KanbanBoard />
        </CardContent>
      </Card>
    </div>
  );
}
