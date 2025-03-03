
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { getDatabase, ref, onValue, update, push, off } from "firebase/database"
import { CoSRecommendation } from "@/types/task"

export function useCosRecommendations() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [recommendations, setRecommendationsState] = useState<CoSRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return

    setIsLoading(true)
    const db = getDatabase()
    const recommendationsRef = ref(db, `users/${currentUser.uid}/recommendations`)

    // Listen for recommendations in Firebase
    const unsubscribe = onValue(recommendationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const recommendationsArray = Object.values(data) as CoSRecommendation[]
        setRecommendationsState(recommendationsArray.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        // If no recommendations exist, create default ones
        const defaultRecommendations: Record<string, CoSRecommendation> = {
          "rec-1": {
            id: "rec-1",
            type: "task",
            content: "Set up your weekly priorities. Start each week by defining your top 3 priorities to stay focused and productive.",
            timestamp: Date.now(),
            priority: "high",
            impact: 75
          },
          "rec-2": {
            id: "rec-2",
            type: "learning",
            content: "Complete your portfolio section. Adding your projects and skills to your portfolio will help you showcase your work.",
            timestamp: Date.now() - 86400000, // 1 day ago
            priority: "medium",
            impact: 60
          },
          "rec-3": {
            id: "rec-3",
            type: "leadership",
            content: "Take the leadership course. Based on your profile, the 'Effective Leadership' training module would be valuable for your growth.",
            timestamp: Date.now() - 172800000, // 2 days ago
            priority: "medium",
            impact: 65
          },
          "rec-4": {
            id: "rec-4",
            type: "efficiency",
            content: "Try time-blocking your calendar. Allocating specific time slots for focused work can increase your productivity by 30%.",
            timestamp: Date.now() - 259200000, // 3 days ago
            priority: "medium",
            impact: 70,
            actualDuration: 15
          }
        }
        
        // Save default recommendations to Firebase
        update(recommendationsRef, defaultRecommendations)
          .then(() => {
            setRecommendationsState(Object.values(defaultRecommendations))
          })
          .catch(error => {
            console.error("Error creating default recommendations:", error)
          })
      }
      setIsLoading(false)
    })

    return () => {
      off(recommendationsRef)
      unsubscribe()
    }
  }, [currentUser])

  // Create a sortable setter function to properly sort recommendations
  const setSortedRecommendations = (recs: CoSRecommendation[]) => {
    // Custom setter that ensures recommendations are sorted by creation date
    setRecommendationsState(recs.sort((a, b) => b.timestamp - a.timestamp))
  }

  const handleFeedback = async (recId: string, feedback: "positive" | "negative") => {
    if (!currentUser) return
    
    try {
      const db = getDatabase()
      const recommendationRef = ref(db, `users/${currentUser.uid}/recommendations/${recId}`)
      
      await update(recommendationRef, {
        feedback
      })
      
      // Update local state
      setSortedRecommendations(
        recommendations.map(rec => 
          rec.id === recId 
            ? { ...rec, feedback } 
            : rec
        )
      )
      
      toast({
        title: "Feedback Recorded",
        description: "Thank you for your feedback! This helps your CoS agent improve."
      })
    } catch (error) {
      console.error("Error recording feedback:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record feedback. Please try again."
      })
    }
  }

  const handleAction = async (recId: string, actionType: string) => {
    if (!currentUser) return
    
    try {
      // Find the recommendation
      const recommendation = recommendations.find(rec => rec.id === recId)
      if (!recommendation) return
      
      // Execute different actions based on the actionType and recommendation type
      switch (actionType) {
        case "start": {
          // For task-type recommendations, navigate to task page or launch task creation
          if (recommendation.type === "task") {
            // Update recommendation to show it was acted upon
            const db = getDatabase()
            const recommendationRef = ref(db, `users/${currentUser.uid}/recommendations/${recId}`)
            await update(recommendationRef, { actedUpon: true })
            
            // If this is about creating a task
            if (recommendation.content.toLowerCase().includes("create") || 
                recommendation.content.toLowerCase().includes("add")) {
              // Navigate to the task creation page
              toast({
                title: "Creating New Task",
                description: "Opening the task creation dialog"
              })
              // In a real implementation, this would open the task creation dialog
              // For this example, we'll just navigate to the dashboard
              navigate("/dashboard")
            } else {
              // Navigate to the task management section
              toast({
                title: "Task Management",
                description: "Navigating to your tasks"
              })
              navigate("/dashboard")
            }
          }
          break
        }
        
        case "view": {
          // For learning-type recommendations, navigate to the training page
          if (recommendation.type === "learning") {
            toast({
              title: "Learning Resource",
              description: "Navigating to training modules"
            })
            navigate("/training")
          }
          break
        }
        
        case "apply": {
          // For efficiency or time recommendations, mark as applied
          if (recommendation.type === "efficiency" || recommendation.type === "time") {
            const db = getDatabase()
            const recommendationRef = ref(db, `users/${currentUser.uid}/recommendations/${recId}`)
            await update(recommendationRef, { 
              actedUpon: true,
              appliedAt: Date.now()
            })
            
            toast({
              title: "Recommendation Applied",
              description: "This suggestion has been applied to your workflow."
            })
            
            // Update local state
            setSortedRecommendations(
              recommendations.map(rec => 
                rec.id === recId 
                  ? { ...rec, actedUpon: true, appliedAt: Date.now() } 
                  : rec
              )
            )
          }
          break
        }
      }
    } catch (error) {
      console.error("Error handling recommendation action:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform the requested action. Please try again."
      })
    }
  }

  // Function to create a new task-specific recommendation
  const createTaskRecommendation = async (taskId: string, title: string, content: string, priority: "high" | "medium" | "low" = "medium") => {
    if (!currentUser) return
    
    try {
      const db = getDatabase()
      const recommendationsRef = ref(db, `users/${currentUser.uid}/recommendations`)
      const newRecKey = push(recommendationsRef).key
      
      if (!newRecKey) throw new Error("Failed to generate recommendation key")
      
      const newRecommendation: CoSRecommendation = {
        id: newRecKey,
        type: "task",
        content,
        timestamp: Date.now(),
        priority,
        impact: priority === "high" ? 80 : priority === "medium" ? 60 : 40,
        metadata: {
          taskId,
          taskTitle: title
        }
      }
      
      await update(ref(db, `users/${currentUser.uid}/recommendations/${newRecKey}`), newRecommendation)
      
      // Add to local state
      setSortedRecommendations([...recommendations, newRecommendation])
      
      return newRecKey
    } catch (error) {
      console.error("Error creating task recommendation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create recommendation. Please try again."
      })
    }
  }

  return {
    recommendations,
    setRecommendations: setSortedRecommendations,
    handleFeedback,
    handleAction,
    createTaskRecommendation,
    isLoading
  }
}
