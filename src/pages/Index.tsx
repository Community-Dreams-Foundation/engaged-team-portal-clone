
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskList } from "@/components/dashboard/TaskList"
import { Button } from "@/components/ui/button"
import { UserCog, MessageSquare, Brain } from "lucide-react"

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
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Chief of Staff Agent</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-l-2 border-primary/20 pl-4">
              <Brain className="h-4 w-4 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium">AI-Powered Assistance</p>
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance and recommendations based on your preferences
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-primary/20 pl-4">
              <MessageSquare className="h-4 w-4 text-primary mt-1" />
              <div>
                <p className="text-sm font-medium">Real-Time Communication</p>
                <p className="text-sm text-muted-foreground">
                  Chat with your AI CoS for instant support and advice
                </p>
              </div>
            </div>

            <Button className="w-full mt-4" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Conversation
            </Button>
          </div>
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
