
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { KanbanSection } from "@/components/dashboard/sections/KanbanSection"
import { DashboardOverview } from "@/components/dashboard/sections/DashboardOverview"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { useGamification } from "@/hooks/useGamification"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { Task } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function Index() {
  const { currentUser, loading: authLoading } = useAuth();
  const { checkStreak } = useGamification();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log("Dashboard rendering with currentUser:", currentUser ? currentUser.uid : "null");
  
  // Check if user has activity today when they load the dashboard
  useEffect(() => {
    if (currentUser) {
      console.log("Checking streak for user:", currentUser.uid);
      checkStreak();
    }
  }, [currentUser, checkStreak]);

  // Fetch tasks for the dashboard
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser?.uid) {
        console.log("No user UID available, skipping task fetch");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching tasks for user:", currentUser.uid);
        setLoading(true);
        const fetchedTasks = await fetchTasks(currentUser.uid);
        console.log("Fetched tasks:", fetchedTasks.length);
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view this page.</p>
          <Button asChild variant="default">
            <Link to="/">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Task Dashboard</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/submit-idea">
                <Plus className="mr-2 h-4 w-4" />
                Submit Project Idea
              </Link>
            </Button>
            <p className="text-muted-foreground flex items-center">
              Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
            </p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        ) : (
          <>
            {/* Task Analytics Overview */}
            <DashboardOverview tasks={tasks} />
            
            {/* Task Management Board */}
            <div className="grid gap-6">
              <KanbanSection />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
