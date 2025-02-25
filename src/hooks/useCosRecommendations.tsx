
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, update } from "firebase/database"
import type { CoSRecommendation } from "@/types/task"

export function useCosRecommendations() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([])

  const handleFeedback = async (recId: string, feedback: "positive" | "negative") => {
    if (!currentUser) return

    try {
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === recId ? { ...rec, feedback } : rec
        )
      )

      const db = getDatabase()
      await update(ref(db, `users/${currentUser.uid}/recommendations/${recId}`), {
        feedback,
        feedbackTimestamp: Date.now()
      })

      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping improve your CoS Agent!",
      })
    } catch (error) {
      console.error("Error saving feedback:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save feedback. Please try again."
      })
    }
  }

  return {
    recommendations,
    setRecommendations,
    handleFeedback
  }
}
