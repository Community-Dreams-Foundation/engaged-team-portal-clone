
import { Trophy, TrendingUp, Target, Medal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, onValue, off } from "firebase/database"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

interface PerformanceData {
  efficiency: number;
  totalTasks: number;
  level: number;
  achievements: string[];
  weeklyTasks: Array<{
    name: string;
    tasks: number;
  }>;
}

const fetchPerformanceData = (userId: string): Promise<PerformanceData> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const performanceRef = ref(db, `users/${userId}/performance`);

    onValue(performanceRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Initialize default performance data for new users
        const defaultData: PerformanceData = {
          efficiency: 92,
          totalTasks: 86,
          level: 3,
          achievements: [
            "Efficiency Expert",
            "Task Master",
            "Goal Crusher"
          ],
          weeklyTasks: [
            { name: 'Mon', tasks: 12 },
            { name: 'Tue', tasks: 19 },
            { name: 'Wed', tasks: 15 },
            { name: 'Thu', tasks: 22 },
            { name: 'Fri', tasks: 18 },
          ]
        };
        resolve(defaultData);
      } else {
        resolve(snapshot.val());
      }
    }, (error) => {
      console.error("Error fetching performance data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch performance data"
      });
      reject(error);
    });
  });
};

export function PerformanceMetrics() {
  const { currentUser } = useAuth();

  const { data: performance } = useQuery({
    queryKey: ['performanceData', currentUser?.uid],
    queryFn: () => fetchPerformanceData(currentUser?.uid || ''),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (!currentUser) return;

    const db = getDatabase();
    const performanceRef = ref(db, `users/${currentUser.uid}/performance`);

    return () => {
      // Cleanup Firebase listeners when component unmounts
      off(performanceRef);
    };
  }, [currentUser]);

  if (!performance) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          Loading performance data...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Performance Metrics</h3>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          Level {performance.level}
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Efficiency</span>
            </div>
            <p className="text-2xl font-bold">{performance.efficiency}%</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Tasks</span>
            </div>
            <p className="text-2xl font-bold">{performance.totalTasks}</p>
          </div>
        </div>

        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performance.weeklyTasks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {performance.achievements.map((achievement, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Medal className="h-3 w-3" />
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

