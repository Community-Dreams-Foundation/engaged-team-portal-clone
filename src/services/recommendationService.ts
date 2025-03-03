
import { getDatabase, ref, update, push } from "firebase/database";
import { CoSRecommendation, Task } from "@/types/task";
import { toast } from "@/hooks/use-toast";
import { analyzeDocumentWithAI, parseDocumentContent } from "@/utils/documentParser";

/**
 * Records feedback for a recommendation in Firebase
 */
export const recordRecommendationFeedback = async (
  userId: string,
  recId: string,
  feedback: "positive" | "negative"
): Promise<void> => {
  try {
    const db = getDatabase();
    const recommendationRef = ref(db, `users/${userId}/recommendations/${recId}`);
    
    await update(recommendationRef, { feedback });
    
    toast({
      title: "Feedback Recorded",
      description: "Thank you for your feedback! This helps your CoS agent improve."
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to record feedback. Please try again."
    });
    throw error;
  }
};

/**
 * Creates a new task recommendation in Firebase
 */
export const createRecommendation = async (
  userId: string,
  taskId: string,
  title: string,
  content: string,
  priority: "high" | "medium" | "low" = "medium"
): Promise<string | undefined> => {
  try {
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    const newRecKey = push(recommendationsRef).key;
    
    if (!newRecKey) throw new Error("Failed to generate recommendation key");
    
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
    };
    
    await update(ref(db, `users/${userId}/recommendations/${newRecKey}`), newRecommendation);
    
    return newRecKey;
  } catch (error) {
    console.error("Error creating task recommendation:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to create recommendation. Please try again."
    });
    return undefined;
  }
};

/**
 * Updates a recommendation to mark actions taken
 */
export const updateRecommendationAction = async (
  userId: string,
  recId: string,
  updates: Partial<CoSRecommendation>
): Promise<void> => {
  try {
    const db = getDatabase();
    const recommendationRef = ref(db, `users/${userId}/recommendations/${recId}`);
    await update(recommendationRef, updates);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    throw error;
  }
};

/**
 * Creates default recommendations if none exist
 */
export const createDefaultRecommendations = async (
  userId: string
): Promise<CoSRecommendation[]> => {
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
  };
  
  try {
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    
    // Save default recommendations to Firebase
    await update(recommendationsRef, defaultRecommendations);
    
    return Object.values(defaultRecommendations);
  } catch (error) {
    console.error("Error creating default recommendations:", error);
    throw error;
  }
};

/**
 * Generates recommendations from document content
 */
export const generateRecommendationsFromDocument = async (
  userId: string,
  fileContent: string,
  fileType: string
): Promise<{
  recommendations: CoSRecommendation[];
  tasks: Partial<Task>[];
  keyInsights: string[];
}> => {
  try {
    // Analyze document content
    const analysis = await analyzeDocumentWithAI(fileContent, fileType);
    
    // Store recommendations in Firebase
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    
    const savedRecommendations: CoSRecommendation[] = [];
    
    // Process and save each recommendation
    for (const rec of analysis.recommendations) {
      const newRecKey = push(recommendationsRef).key;
      
      if (!newRecKey) continue;
      
      const newRecommendation: CoSRecommendation = {
        id: newRecKey,
        type: rec.type || "task",
        content: rec.content || "",
        timestamp: Date.now(),
        priority: rec.priority || "medium",
        impact: rec.impact || 50,
        actualDuration: rec.actualDuration,
        metadata: rec.metadata || {}
      };
      
      await update(ref(db, `users/${userId}/recommendations/${newRecKey}`), newRecommendation);
      savedRecommendations.push(newRecommendation);
    }
    
    return {
      recommendations: savedRecommendations,
      tasks: analysis.tasks,
      keyInsights: analysis.metadata.keyInsights
    };
  } catch (error) {
    console.error("Error generating recommendations from document:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to analyze document content. Please try again."
    });
    return {
      recommendations: [],
      tasks: [],
      keyInsights: []
    };
  }
};

/**
 * Processes a document and creates tasks and recommendations
 */
export const processDocumentForTaskCreation = async (
  userId: string,
  file: File
): Promise<{
  success: boolean;
  recommendations: CoSRecommendation[];
  tasks: Partial<Task>[];
  insights: string[];
}> => {
  try {
    // Read file content
    const content = await readFileContent(file);
    if (!content) {
      throw new Error("Failed to read file content");
    }
    
    // Generate recommendations and tasks
    const result = await generateRecommendationsFromDocument(
      userId,
      content,
      file.type
    );
    
    return {
      success: true,
      recommendations: result.recommendations,
      tasks: result.tasks,
      insights: result.keyInsights
    };
  } catch (error) {
    console.error("Error processing document for task creation:", error);
    return {
      success: false,
      recommendations: [],
      tasks: [],
      insights: []
    };
  }
};

/**
 * Reads content from a file
 */
const readFileContent = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
      resolve(null);
    };
    
    if (file.type.includes("image")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
};
