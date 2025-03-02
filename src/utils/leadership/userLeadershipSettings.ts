
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export interface LeadershipUserSettings {
  preferredDomain?: string
  careerGoal?: string
  mentorshipEnabled: boolean
  careerStatement?: string
  visibilityPreference: boolean
  lastUpdated?: number
}

/**
 * Update a user's leadership settings
 */
export async function updateLeadershipSettings(
  userId: string,
  settings: Partial<LeadershipUserSettings>
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    const updatedSettings = {
      ...settings,
      lastUpdated: Date.now()
    }
    
    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        leadershipSettings: updatedSettings
      })
    } else {
      // Create a new document
      await setDoc(userRef, {
        leadershipSettings: updatedSettings
      })
    }
  } catch (error) {
    console.error("Error updating leadership settings:", error)
    throw new Error("Failed to update leadership settings")
  }
}

/**
 * Fetch a user's leadership settings
 */
export async function getLeadershipSettings(
  userId: string
): Promise<LeadershipUserSettings | null> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists() && userDoc.data().leadershipSettings) {
      return userDoc.data().leadershipSettings as LeadershipUserSettings
    }
    
    return null
  } catch (error) {
    console.error("Error fetching leadership settings:", error)
    return null
  }
}
