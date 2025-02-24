
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function Index() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Real-Time Task List</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon: View and manage your tasks in real-time
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Chief of Staff Agent</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon: Get personalized guidance and recommendations
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">
            Coming soon: Track your performance and progress
          </p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
