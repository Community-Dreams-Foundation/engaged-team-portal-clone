
import { Card } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TaskList } from "@/components/dashboard/TaskList"
import { Button } from "@/components/ui/button"
import { UserCog, MessageSquare, Brain, Trophy, TrendingUp, Target, Medal, ListChecks, ArrowUpDown, GraduationCap, BookOpen, CheckCircle, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// Mock data with Firebase-like structure
const performanceData = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 18 },
]

const trainingModules = [
  {
    id: 1,
    title: "CoS Fundamentals",
    description: "Learn the core principles of being an effective Chief of Staff",
    progress: 100,
    duration: "45 min",
    completed: true
  },
  {
    id: 2,
    title: "Strategic Planning",
    description: "Master the art of strategic planning and execution",
    progress: 60,
    duration: "1h 15min",
    completed: false
  },
  {
    id: 3,
    title: "Communication Skills",
    description: "Develop advanced communication and presentation skills",
    progress: 30,
    duration: "1h",
    completed: false
  },
  {
    id: 4,
    title: "Time Management",
    description: "Optimize your productivity and time allocation",
    progress: 0,
    duration: "50 min",
    completed: false
  }
]

// Mock Firebase query functions - to be replaced with real Firebase calls
const fetchTrainingModules = async (userId: string) => {
  // This will be replaced with actual Firebase query
  return trainingModules;
}

const fetchPerformanceData = async (userId: string) => {
  // This will be replaced with actual Firebase query
  return performanceData;
}

const fetchRecommendations = async (userId: string) => {
  // This will be replaced with actual Firebase query
  return [
    "Prioritize the quarterly review meeting",
    "Schedule team sync for project updates"
  ];
}

const fetchActionItems = async (userId: string) => {
  // This will be replaced with actual Firebase query
  return [
    { id: 1, text: "Review Q4 strategy document", completed: false },
    { id: 2, text: "Prepare meeting agenda", completed: false },
    { id: 3, text: "Follow up with team leads", completed: false }
  ];
}

export default function Index() {
  const { currentUser } = useAuth();
  
  // Set up React Query hooks with Firebase-like structure
  const { data: modules = trainingModules } = useQuery({
    queryKey: ['trainingModules', currentUser?.uid],
    queryFn: () => fetchTrainingModules(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  const { data: performance = performanceData } = useQuery({
    queryKey: ['performanceData', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', currentUser?.uid],
    queryFn: () => fetchRecommendations(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  const { data: actionItems = [] } = useQuery({
    queryKey: ['actionItems', currentUser?.uid],
    queryFn: () => fetchActionItems(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  const completedModules = modules.filter(module => module.completed).length;

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Training Modules Section */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Training Modules</h3>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {completedModules}/{modules.length} Completed
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="relative group rounded-lg border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{module.title}</h4>
                    </div>
                    {module.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {module.duration}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {module.description}
                  </p>

                  <div className="space-y-3">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Progress: {module.progress}%
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Play className="h-4 w-4 mr-1" />
                        {module.completed ? "Review" : "Continue"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-secondary/50 p-2 rounded-md text-sm">
                    {recommendation}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">Action Items</h4>
              </div>
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" checked={item.completed} />
                    <span>{item.text}</span>
                  </div>
                ))}
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
                <BarChart data={performance}>
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

