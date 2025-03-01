
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { KanbanSection } from "@/components/dashboard/sections/KanbanSection"
import { DashboardOverview } from "@/components/dashboard/sections/DashboardOverview"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useGamification } from "@/hooks/useGamification"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { Task } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"

export default function Index() {
  const { currentUser } = useAuth();
  const { checkStreak } = useGamification();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user has activity today when they load the dashboard
  useEffect(() => {
    if (currentUser) {
      checkStreak();
    }
  }, [currentUser, checkStreak]);

  // Fetch tasks for the dashboard
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks(currentUser.uid);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Error loading tasks",
          description: "Failed to load your tasks. Please refresh the page."
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [currentUser?.uid, toast]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Task Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
          </p>
        </div>
        
        {/* Task Analytics Overview */}
        <DashboardOverview tasks={tasks} />
        
        {/* Task Management Board */}
        <div className="grid gap-6">
          <KanbanSection />
        </div>
      </div>
    </DashboardLayout>
  );
}
