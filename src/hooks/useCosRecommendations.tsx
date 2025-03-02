
import { useState, useCallback, useEffect } from 'react';
import { CoSRecommendation, Task } from '@/types/task';
import { generateTaskRecommendations, analyzeTaskPatterns, suggestTeamCollaboration } from '@/utils/tasks/cosTaskRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTasks } from '@/utils/tasks/basicOperations';

export function useCosRecommendations() {
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Fetch recommendations based on user tasks and behavior
  const fetchRecommendations = useCallback(async (userId: string, taskId?: string) => {
    try {
      setLoading(true);
      
      console.log(`Fetching recommendations for user: ${userId}${taskId ? `, task: ${taskId}` : ''}`);
      
      // Fetch the user's tasks to generate personalized recommendations
      const userTasks = await fetchTasks(userId);
      
      // Generate different types of recommendations
      const taskRecs = await generateTaskRecommendations(userId, userTasks);
      
      // Analyze completed tasks for patterns
      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const patternRecs = await analyzeTaskPatterns(userId, completedTasks);
      
      // Mock team members for collaboration recommendations
      const mockTeamMembers = [
        {id: "team-1", name: "Alice", skills: ["design", "UI/UX"]},
        {id: "team-2", name: "Bob", skills: ["backend", "data analysis"]},
        {id: userId, name: "You", skills: ["project management", "frontend"]}
      ];
      
      const teamRecs = await suggestTeamCollaboration(userId, mockTeamMembers);
      
      // Combine all recommendations and sort by priority and impact
      const allRecommendations = [...taskRecs, ...patternRecs, ...teamRecs]
        .sort((a, b) => {
          // Sort by priority first
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = 
            (priorityOrder[a.priority || 'low'] || 0) - 
            (priorityOrder[b.priority || 'low'] || 0);
          
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by impact (higher impact first)
          return (b.impact || 0) - (a.impact || 0);
        });
      
      setRecommendations(allRecommendations);
      return allRecommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch recommendations when the user changes
  useEffect(() => {
    if (currentUser?.uid) {
      fetchRecommendations(currentUser.uid);
    }
  }, [currentUser, fetchRecommendations]);

  const provideRecommendationFeedback = useCallback(async (
    recommendationId: string, 
    feedback: 'positive' | 'negative'
  ) => {
    try {
      // Update local state optimistically
      setRecommendations(current => 
        current.map(rec => 
          rec.id === recommendationId ? { ...rec, feedback } : rec
        )
      );
      
      // In a real app, you would send this feedback to your backend
      console.log(`Recommendation feedback for ${recommendationId}: ${feedback}`);
      
      return true;
    } catch (error) {
      console.error('Error providing recommendation feedback:', error);
      return false;
    }
  }, []);

  // Add the missing functions to match what CosAgent.tsx expects
  const handleFeedback = useCallback((recId: string, feedback: 'positive' | 'negative') => {
    provideRecommendationFeedback(recId, feedback);
  }, [provideRecommendationFeedback]);

  return {
    recommendations,
    loading,
    fetchRecommendations,
    provideRecommendationFeedback,
    // Add these exports to match what's used in CosAgent.tsx
    setRecommendations,
    handleFeedback
  };
}
