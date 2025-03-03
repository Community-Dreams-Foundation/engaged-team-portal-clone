
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { CoSRecommendation } from "@/types/task"

export function useCosRecommendations() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
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
            priority: "high"
          },
          "rec-2": {
            id: "rec-2",
            type: "time",
            content: "Complete your portfolio section. Adding your projects and skills to your portfolio will help you showcase your work.",
            timestamp: Date.now() - 86400000, // 1 day ago
            priority: "medium"
          },
          "rec-3": {
            id: "rec-3",
            type: "leadership",
            content: "Take the leadership course. Based on your profile, the 'Effective Leadership' training module would be valuable for your growth.",
            timestamp: Date.now() - 172800000, // 2 days ago
            priority: "medium"
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

    return () => unsubscribe()
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

  return {
    recommendations,
    setRecommendations: setSortedRecommendations,
    handleFeedback,
    isLoading
  }
}
