
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TrainingModules } from "@/components/dashboard/TrainingModules"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { CommunicationFeed } from "@/components/dashboard/CommunicationFeed"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { TieredSupport } from "@/components/support/TieredSupport"
import { Card } from "@/components/ui/card"

export default function Index() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Kanban Board Section with Task Management */}
        <div className="col-span-full">
          <Card className="p-6">
            <KanbanBoard />
          </Card>
        </div>

        {/* CoS Agent and Training Section */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <TrainingModules />
          </Card>
        </div>

        {/* Performance and Portfolio Section */}
        <div className="space-y-4">
          <CosAgent />
          <Card className="p-6">
            <PerformanceMetrics />
          </Card>
        </div>

        {/* Support and Communication Section */}
        <div className="col-span-full">
          <Card className="p-6">
            <TieredSupport />
          </Card>
        </div>

        {/* Internal Communication Feed */}
        <div className="col-span-full lg:col-span-2">
          <Card className="p-6">
            <CommunicationFeed />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
