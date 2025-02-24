
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskList } from "@/components/dashboard/TaskList"
import { Button } from "@/components/ui/button"
import { UserCog, MessageSquare, Brain, Trophy, TrendingUp, Target, Medal, ListChecks, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Sample data - in a real app, this would come from your backend
const performanceData = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 18 },
]

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
          
          {/* AI Interaction Interface */}
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto space-y-3">
              <div className="flex items-start gap-2">
                <UserCog className="h-4 w-4 mt-1 text-primary" />
                <p className="text-sm">How can I assist you today?</p>
              </div>
              {/* Sample conversation history */}
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Please help me prioritize my tasks.</p>
              </div>
              <div className="flex items-start gap-2">
                <UserCog className="h-4 w-4 mt-1 text-primary" />
                <p className="text-sm">Based on urgency and impact, I recommend...</p>
              </div>
            </div>

            <Textarea 
              placeholder="Type your message here..."
              className="resize-none"
            />

            <Button className="w-full" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>

            {/* Recommendations */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Recommendations</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-secondary/50 p-2 rounded-md text-sm">
                  Prioritize the quarterly review meeting
                </div>
                <div className="bg-secondary/50 p-2 rounded-md text-sm">
                  Schedule team sync for project updates
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Action Items</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>Review Q4 strategy document</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>Prepare meeting agenda</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>Follow up with team leads</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6 md:col-start-2 lg:col-start-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Performance Metrics</h3>
            </div>
            <Badge variant="secondary" className="animate-pulse">
              Level 3
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Efficiency</span>
                </div>
                <p className="text-2xl font-bold">92%</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Tasks</span>
                </div>
                <p className="text-2xl font-bold">86</p>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Achievements</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Medal className="h-3 w-3" />
                  Efficiency Expert
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Task Master
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Goal Crusher
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
