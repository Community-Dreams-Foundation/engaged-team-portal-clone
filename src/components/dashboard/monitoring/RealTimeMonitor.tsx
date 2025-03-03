
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getMonitoringStats } from '@/services/monitoringService';

export function RealTimeMonitor() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    taskCompletionRate: 0,
    onTimeCompletion: 0,
    averageTaskDuration: 0,
    blockedTasks: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      try {
        const monitoringStats = await getMonitoringStats(currentUser.uid);
        setStats(monitoringStats);
      } catch (error) {
        console.error("Error fetching monitoring stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Task Completion Rate</span>
            <span>{stats.taskCompletionRate}%</span>
          </div>
          <Progress value={stats.taskCompletionRate} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>On-Time Completion</span>
            <span>{stats.onTimeCompletion}%</span>
          </div>
          <Progress value={stats.onTimeCompletion} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-md p-3">
            <div className="text-muted-foreground text-sm">Avg. Task Duration</div>
            <div className="text-xl font-semibold">{stats.averageTaskDuration} min</div>
          </div>
          <div className="bg-muted rounded-md p-3">
            <div className="text-muted-foreground text-sm">Blocked Tasks</div>
            <div className="text-xl font-semibold">{stats.blockedTasks}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
