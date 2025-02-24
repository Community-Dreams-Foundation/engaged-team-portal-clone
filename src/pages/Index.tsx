
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskList } from "@/components/dashboard/TaskList"

export default function Index() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Real-Time Tasks</h3>
            <TaskList />
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Chief of Staff Agent</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon: Get personalized guidance and recommendations
          </p>
        </Card>
        <Card className="p-6 md:col-start-2 lg:col-start-3">
          <h3 className="font-semibold mb-2">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon: Track your performance and progress
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
