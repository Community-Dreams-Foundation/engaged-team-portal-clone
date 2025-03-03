
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types/task';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { 
  checkOverdueTasks, 
  checkApproachingDeadlines, 
  checkDurationExceeded, 
  checkBlockedDependencies 
} from '@/services/monitoringService';

export function TaskMonitor() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [approachingDeadlines, setApproachingDeadlines] = useState<Task[]>([]);
  const [durationExceeded, setDurationExceeded] = useState<Task[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const db = getDatabase();
    const tasksRef = ref(db, `users/${currentUser.uid}/tasks`);

    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasksData = snapshot.val();
        const tasksList = Object.keys(tasksData).map(key => ({
          id: key,
          ...tasksData[key],
        }));
        
        setTasks(tasksList);
        
        // Update all the task categories
        setOverdueTasks(checkOverdueTasks(tasksList));
        setApproachingDeadlines(checkApproachingDeadlines(tasksList));
        setDurationExceeded(checkDurationExceeded(tasksList));
        setBlockedTasks(checkBlockedDependencies(tasksList));
      } else {
        setTasks([]);
        setOverdueTasks([]);
        setApproachingDeadlines([]);
        setDurationExceeded([]);
        setBlockedTasks([]);
      }
      
      setLoading(false);
    });

    return () => {
      off(tasksRef);
      unsubscribe();
    };
  }, [currentUser]);

  const renderTaskList = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No tasks to display
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {taskList.map(task => (
          <div key={task.id} className="flex items-center border p-3 rounded-md">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {task.status}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {task.estimatedDuration && (
                  <span className="text-xs text-muted-foreground">
                    Est: {task.estimatedDuration} min
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="overdue">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overdue" className="relative">
                Overdue
                {overdueTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {overdueTasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approaching" className="relative">
                Approaching
                {approachingDeadlines.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-warning text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {approachingDeadlines.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="duration" className="relative">
                Duration
                {durationExceeded.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-muted-foreground text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {durationExceeded.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="blocked" className="relative">
                Blocked
                {blockedTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-muted-foreground text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {blockedTasks.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overdue" className="space-y-4">
              <p className="text-sm text-muted-foreground">Tasks that have passed their due date</p>
              {renderTaskList(overdueTasks)}
            </TabsContent>
            
            <TabsContent value="approaching" className="space-y-4">
              <p className="text-sm text-muted-foreground">Tasks due within the next 24 hours</p>
              {renderTaskList(approachingDeadlines)}
            </TabsContent>
            
            <TabsContent value="duration" className="space-y-4">
              <p className="text-sm text-muted-foreground">Tasks that have exceeded their estimated duration</p>
              {renderTaskList(durationExceeded)}
            </TabsContent>
            
            <TabsContent value="blocked" className="space-y-4">
              <p className="text-sm text-muted-foreground">Tasks blocked by dependencies</p>
              {renderTaskList(blockedTasks)}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
