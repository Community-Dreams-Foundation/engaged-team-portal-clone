
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { CoSRecommendation } from "@/types/task";
import { generatePersonalizedRecommendations } from "@/services/recommendationService";

export function usePersonalizedRecommendations() {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [learningProfile, setLearningProfile] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const db = getDatabase();
    
    // Listen for changes to the learning profile
    const profileRef = ref(db, `users/${currentUser.uid}/learningProfile`);
    const profileListener = onValue(profileRef, async (snapshot) => {
      const profile = snapshot.exists() ? snapshot.val() : null;
      setLearningProfile(profile);
      
      // Generate personalized recommendations
      try {
        const personalizedRecs = await generatePersonalizedRecommendations(currentUser.uid);
        setRecommendations(personalizedRecs);
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      off(profileRef);
      profileListener();
    };
  }, [currentUser]);

  const refreshRecommendations = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const personalizedRecs = await generatePersonalizedRecommendations(currentUser.uid);
      setRecommendations(personalizedRecs);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    learningProfile,
    refreshRecommendations,
    adaptiveScore: learningProfile?.adaptiveScore || 50
  };
}
