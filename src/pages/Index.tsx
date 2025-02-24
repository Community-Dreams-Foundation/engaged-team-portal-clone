
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskList } from "@/components/dashboard/TaskList"
import { Button } from "@/components/ui/button"
import { UserCog, MessageSquare, Brain, Trophy, TrendingUp, Target, Medal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
