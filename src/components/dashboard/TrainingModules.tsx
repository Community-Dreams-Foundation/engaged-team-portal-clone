
import { GraduationCap, BookOpen, CheckCircle, Play, Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import {
  getDatabase,
  ref,
  onValue,
  update,
  query,
  orderByChild,
  off
} from "firebase/database"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

type TrainingModule = {
  id: number
  title: string
  description: string
  progress: number
  duration: string
  completed: boolean
}

const fetchTrainingModules = async (userId: string): Promise<TrainingModule[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const modulesRef = query(ref(db, `users/${userId}/trainingModules`), orderByChild('id'))

    onValue(modulesRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Initialize default modules for new users
        const defaultModules = [
          {
            id: 1,
            title: "CoS Fundamentals",
            description: "Learn the core principles of being an effective Chief of Staff",
            progress: 0,
            duration: "45 min",
            completed: false
          },
          {
            id: 2,
            title: "Strategic Planning",
            description: "Master the art of strategic planning and execution",
            progress: 0,
            duration: "1h 15min",
            completed: false
          },
          {
            id: 3,
            title: "Communication Skills",
            description: "Develop advanced communication and presentation skills",
            progress: 0,
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
        
        update(ref(db, `users/${userId}`), {
          trainingModules: defaultModules
        })
        resolve(defaultModules)
      } else {
        const modules: TrainingModule[] = []
        snapshot.forEach((childSnapshot) => {
          modules.push({
            id: childSnapshot.val().id,
            ...childSnapshot.val()
          })
        })
        resolve(modules)
      }
    }, (error) => {
      console.error("Error fetching training modules:", error)
      reject(error)
    })
  })
}

export function TrainingModules() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: modules = [] } = useQuery({
    queryKey: ['trainingModules', currentUser?.uid],
    queryFn: () => fetchTrainingModules(currentUser?.uid || ''),
    enabled: !!currentUser,
  })

  useEffect(() => {
    if (!currentUser) return

    const db = getDatabase()
    const modulesRef = ref(db, `users/${currentUser.uid}/trainingModules`)

    const unsubscribe = onValue(modulesRef, () => {
      queryClient.invalidateQueries({ queryKey: ['trainingModules', currentUser.uid] })
    })

    return () => {
      off(modulesRef)
      unsubscribe()
    }
  }, [currentUser, queryClient])

  const handleModuleAction = async (moduleId: number) => {
    if (!currentUser) return

    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newProgress = module.completed ? module.progress : Math.min(100, module.progress + 20)
    const completed = newProgress === 100

    try {
      const db = getDatabase()
      await update(ref(db, `users/${currentUser.uid}/trainingModules/${moduleId - 1}`), {
        progress: newProgress,
        completed
      })

      toast({
        title: completed ? "Module Completed!" : "Progress Updated",
        description: completed 
          ? `Congratulations on completing ${module.title}!`
          : `Progress on ${module.title} updated to ${newProgress}%`
      })
    } catch (error) {
      console.error("Error updating module progress:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update module progress. Please try again."
      })
    }
  }

  const completedModules = modules.filter(module => module.completed).length

  return (
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
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2"
                  onClick={() => handleModuleAction(module.id)}
                  disabled={!currentUser}
                >
                  <Play className="h-4 w-4 mr-1" />
                  {module.completed ? "Review" : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
