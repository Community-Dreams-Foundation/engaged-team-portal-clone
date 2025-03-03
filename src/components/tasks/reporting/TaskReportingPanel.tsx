
import { useState, useMemo } from "react";
import { Task } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  Calendar,
  Tag
} from "lucide-react";
import { 
  calculateTaskMetrics, 
  tasksToCSV, 
  downloadCSV, 
  calculateTaskTrends,
  activitiesToCSV
} from "@/utils/exportUtils";
import { fetchRecentActivities } from "@/utils/tasks/activityOperations";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

interface TaskReportingPanelProps {
  tasks: Task[];
}

export function TaskReportingPanel({ tasks }: TaskReportingPanelProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activityData, setActivityData] = useState<Array<{
    taskId: string;
    taskTitle: string;
    activity: Task["activities"][0];
  }> | null>(null);

  const metrics = useMemo(() => calculateTaskMetrics(tasks), [tasks]);
  const trendData = useMemo(() => calculateTaskTrends(tasks, 7), [tasks]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const statusData = [
    { name: 'Completed', value: metrics.completed },
    { name: 'In Progress', value: metrics.inProgress },
    { name: 'To Do', value: metrics.todo },
    { name: 'Blocked', value: metrics.blocked }
  ];

  const priorityData = [
    { name: 'High', value: metrics.priorityDistribution.high },
    { name: 'Medium', value: metrics.priorityDistribution.medium },
    { name: 'Low', value: metrics.priorityDistribution.low }
  ];

  const handleExportTasks = () => {
    try {
      const csvContent = tasksToCSV(tasks);
      downloadCSV(csvContent, `task-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export Successful",
        description: `${tasks.length} tasks exported to CSV`,
      });
    } catch (error) {
      console.error("Error exporting tasks:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export tasks. Please try again."
      });
    }
  };

  const handleExportActivities = async () => {
    if (!currentUser?.uid) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to export activities."
      });
      return;
    }

    try {
      setLoading(true);
      const activities = await fetchRecentActivities(currentUser.uid, 100);
      
      // Cache the activities data for later use
      setActivityData(activities);
      
      const csvContent = activitiesToCSV(activities);
      downloadCSV(csvContent, `activity-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export Successful",
        description: `${activities.length} activities exported to CSV`,
      });
    } catch (error) {
      console.error("Error exporting activities:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export activities. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Task Performance Reporting</CardTitle>
            <CardDescription>View and export task metrics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleExportTasks}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export Tasks
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportActivities}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export Activities
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Completion Rate</h3>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      {metrics.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.completed} of {metrics.total} tasks completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Estimation Accuracy</h3>
                    </div>
                    <Badge variant="outline" className="bg-blue-50">
                      {metrics.estimationAccuracy.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Avg Est: {metrics.avgEstimatedDuration.toFixed(0)} min | 
                    Avg Actual: {metrics.avgActualDuration.toFixed(0)} min
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">Overdue Tasks</h3>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {metrics.overdue}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.overdue} task{metrics.overdue !== 1 ? 's' : ''} past due date
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> 
                        Completed
                      </span>
                      <span className="text-sm font-medium">{metrics.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> 
                        In Progress
                      </span>
                      <span className="text-sm font-medium">{metrics.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> 
                        To Do
                      </span>
                      <span className="text-sm font-medium">{metrics.todo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> 
                        Blocked
                      </span>
                      <span className="text-sm font-medium">{metrics.blocked}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> 
                        High Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.high}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div> 
                        Medium Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.medium}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> 
                        Low Priority
                      </span>
                      <span className="text-sm font-medium">{metrics.priorityDistribution.low}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Task Activity (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="created" name="Tasks Created" fill="#8884d8" />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Task Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Priority Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#ff8042" />
                        <Cell fill="#ffbb28" />
                        <Cell fill="#00c49f" />
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
