
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, onValue, off } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { fetchTrainingModules, updateModuleProgress, TrainingModule } from "@/utils/trainingModules"

export const useTrainingModules = () => {
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
      await updateModuleProgress(currentUser.uid, moduleId, newProgress, completed)

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

  return {
    modules,
    handleModuleAction,
    isAuthenticated: !!currentUser
  }
}

