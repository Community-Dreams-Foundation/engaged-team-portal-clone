
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { ChevronRight, Kanban, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function KanbanSection() {
  return (
    <div className="col-span-full">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Kanban className="mr-2 h-5 w-5 text-primary" />
              Task Management Board
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-sm gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="default" size="sm" className="text-sm gap-1">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
              <Button variant="ghost" size="sm" className="text-sm text-primary hover:underline flex items-center">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your tasks by dragging them across different stages
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <KanbanBoard />
        </CardContent>
      </Card>
    </div>
  );
}
