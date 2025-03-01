
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, onValue, update } from "firebase/database"

type Recommendation = {
  id: string
  title: string
  description: string
  type: "task" | "learning" | "networking" | "productivity"
  priority: "high" | "medium" | "low"
  createdAt: number
  actionable: boolean
  feedback?: {
    useful: boolean
    implemented: boolean
    timestamp: number
  }
}

export function useCosRecommendations() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
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
        const recommendationsArray = Object.values(data) as Recommendation[]
        setRecommendations(recommendationsArray.sort((a, b) => b.createdAt - a.createdAt))
      } else {
        // If no recommendations exist, create default ones
        const defaultRecommendations: Record<string, Recommendation> = {
          "rec-1": {
            id: "rec-1",
            title: "Set up your weekly priorities",
            description: "Start each week by defining your top 3 priorities to stay focused and productive.",
            type: "productivity",
            priority: "high",
            createdAt: Date.now(),
            actionable: true
          },
          "rec-2": {
            id: "rec-2",
            title: "Complete your portfolio section",
            description: "Adding your projects and skills to your portfolio will help you showcase your work.",
            type: "task",
            priority: "medium",
            createdAt: Date.now() - 86400000, // 1 day ago
            actionable: true
          },
          "rec-3": {
            id: "rec-3",
            title: "Take the leadership course",
            description: "Based on your profile, the 'Effective Leadership' training module would be valuable for your growth.",
            type: "learning",
            priority: "medium",
            createdAt: Date.now() - 172800000, // 2 days ago
            actionable: true
          }
        }
        
        // Save default recommendations to Firebase
        update(recommendationsRef, defaultRecommendations)
          .then(() => {
            setRecommendations(Object.values(defaultRecommendations))
          })
          .catch(error => {
            console.error("Error creating default recommendations:", error)
          })
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const setRecommendations = (recs: Recommendation[]) => {
    // Custom setter that ensures recommendations are sorted by creation date
    setRecommendations(recs.sort((a, b) => b.createdAt - a.createdAt))
  }

  const handleFeedback = async (recommendationId: string, feedback: { useful: boolean, implemented: boolean }) => {
    if (!currentUser) return
    
    try {
      const db = getDatabase()
      const recommendationRef = ref(db, `users/${currentUser.uid}/recommendations/${recommendationId}/feedback`)
      
      await update(recommendationRef, {
        ...feedback,
        timestamp: Date.now()
      })
      
      // Update local state
      setRecommendations(
        recommendations.map(rec => 
          rec.id === recommendationId 
            ? { 
                ...rec, 
                feedback: { 
                  ...feedback, 
                  timestamp: Date.now() 
                } 
              } 
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

  return {
    recommendations,
    setRecommendations,
    handleFeedback,
    isLoading
  }
}
