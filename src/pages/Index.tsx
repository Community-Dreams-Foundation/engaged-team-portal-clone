
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TrainingModules } from "@/components/dashboard/TrainingModules"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { CommunicationFeed } from "@/components/dashboard/CommunicationFeed"
import { Card } from "@/components/ui/card"

export default function Index() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Training Modules Section */}
        <div className="md:col-span-2">
          <TrainingModules />
        </div>

        <CosAgent />

        <Card className="p-6 md:col-start-2 lg:col-start-3">
          <PerformanceMetrics />
        </Card>

        <Card className="p-6 md:col-span-2">
          <CommunicationFeed />
        </Card>
      </div>
    </DashboardLayout>
  )
}
