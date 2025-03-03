
import { CoSRecommendation, Task } from "@/types/task";
import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Extracts structured information from uploaded document content
 */
export const parseDocumentContent = async (
  content: string,
  fileType: string
): Promise<{
  title?: string;
  description?: string;
  tasks: Partial<Task>[];
  dependencies: Record<string, string[]>;
  estimatedDurations: Record<string, number>;
}> => {
  try {
    // Default structure
    const result = {
      title: "",
      description: "",
      tasks: [] as Partial<Task>[],
      dependencies: {} as Record<string, string[]>,
      estimatedDurations: {} as Record<string, number>
    };

    // Handle different file types
    if (fileType.includes("markdown") || fileType.includes("md") || fileType.includes("text/plain")) {
      // Parse markdown content
      const parsedContent = marked.parse(content);
      // Fix the typing issue by ensuring we're working with a string
      const sanitizedContent = DOMPurify.sanitize(parsedContent.toString());
      
      // Extract title from first heading
      const titleMatch = sanitizedContent.match(/<h1[^>]*>(.*?)<\/h1>/);
      if (titleMatch && titleMatch[1]) {
        result.title = titleMatch[1].trim();
      }
      
      // Extract description from first paragraph after title
      const descMatch = sanitizedContent.match(/<p[^>]*>(.*?)<\/p>/);
      if (descMatch && descMatch[1]) {
        result.description = descMatch[1].trim();
      }
      
      // Extract tasks from lists
      const taskMatches = sanitizedContent.matchAll(/<li[^>]*>(.*?)<\/li>/g);
      if (taskMatches) {
        for (const match of taskMatches) {
          if (match[1]) {
            const taskTitle = match[1].trim();
            
            // Estimate duration based on complexity indicators in the task
            const complexity = estimateComplexity(taskTitle);
            const duration = calculateDuration(complexity);
            
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            result.tasks.push({
              title: taskTitle,
              description: `Task extracted from document: ${taskTitle}`,
              status: "todo",
              estimatedDuration: duration,
              actualDuration: 0,
              priority: getPriorityFromContent(taskTitle)
            });
            
            result.estimatedDurations[taskId] = duration;
          }
        }
      }
      
      // Try to extract dependencies from the content
      extractDependencies(sanitizedContent, result);
    } else if (fileType.includes("pdf") || fileType.includes("doc")) {
      // For PDF/DOC files we would need additional libraries
      // This would be implemented with pdf.js or similar
      result.title = "Document Import";
      result.description = "Imported from " + fileType + " document. Full parsing requires PDF/DOC processing.";
    } else {
      result.title = "Unsupported Format";
      result.description = "The document format is not supported for detailed parsing.";
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing document:", error);
    return {
      title: "Parsing Error",
      description: "There was an error parsing the document content.",
      tasks: [],
      dependencies: {},
      estimatedDurations: {}
    };
  }
};

/**
 * Estimates task complexity based on content analysis
 */
const estimateComplexity = (content: string): "low" | "medium" | "high" => {
  const lowComplexityTerms = ["simple", "basic", "minor", "quick", "easy"];
  const highComplexityTerms = ["complex", "challenging", "difficult", "major", "comprehensive"];
  
  content = content.toLowerCase();
  
  if (highComplexityTerms.some(term => content.includes(term))) {
    return "high";
  }
  
  if (lowComplexityTerms.some(term => content.includes(term))) {
    return "low";
  }
  
  // Default to medium complexity
  return "medium";
};

/**
 * Calculates estimated duration in minutes based on complexity
 */
const calculateDuration = (complexity: "low" | "medium" | "high"): number => {
  // Using 3-hour max constraint (180 minutes)
  switch (complexity) {
    case "low":
      return 60; // 1 hour
    case "high":
      return 180; // 3 hours (maximum)
    case "medium":
    default:
      return 120; // 2 hours
  }
};

/**
 * Determines task priority based on content analysis
 */
const getPriorityFromContent = (content: string): "low" | "medium" | "high" => {
  const highPriorityTerms = ["urgent", "critical", "important", "high priority", "asap"];
  const lowPriorityTerms = ["low priority", "when possible", "optional", "nice to have"];
  
  content = content.toLowerCase();
  
  if (highPriorityTerms.some(term => content.includes(term))) {
    return "high";
  }
  
  if (lowPriorityTerms.some(term => content.includes(term))) {
    return "low";
  }
  
  return "medium";
};

/**
 * Extracts dependency relationships between tasks
 */
const extractDependencies = (
  content: string, 
  result: { dependencies: Record<string, string[]>, tasks: Partial<Task>[] }
) => {
  // Look for patterns like "Task X depends on Task Y" or "After Task X, do Task Y"
  const dependencyPatterns = [
    /([^.]+) depends on ([^.]+)/gi,
    /after ([^,]+), ([^.]+)/gi,
    /([^.]+) requires ([^.]+) first/gi
  ];
  
  for (const pattern of dependencyPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[2]) {
        const taskTitle = match[1].trim();
        const dependencyTitle = match[2].trim();
        
        // Find tasks by title
        const taskIndex = result.tasks.findIndex(t => t.title?.includes(taskTitle));
        const dependencyIndex = result.tasks.findIndex(t => t.title?.includes(dependencyTitle));
        
        if (taskIndex !== -1 && dependencyIndex !== -1) {
          const taskId = `task-${taskIndex}`;
          const dependencyId = `task-${dependencyIndex}`;
          
          if (!result.dependencies[taskId]) {
            result.dependencies[taskId] = [];
          }
          
          if (!result.dependencies[taskId].includes(dependencyId)) {
            result.dependencies[taskId].push(dependencyId);
          }
        }
      }
    }
  }
};

/**
 * Analyzes document content using AI to identify key components
 */
export const analyzeDocumentWithAI = async (
  content: string, 
  fileType: string
): Promise<{
  recommendations: Partial<CoSRecommendation>[];
  tasks: Partial<Task>[];
  metadata: {
    keyInsights: string[];
    suggestedSkills: string[];
    estimatedEffort: number;
  };
}> => {
  try {
    // Basic parsing first
    const parsedContent = await parseDocumentContent(content, fileType);
    
    // This is where we would integrate with an AI service
    // For now, we'll use heuristics to generate recommendations
    
    const recommendations: Partial<CoSRecommendation>[] = [];
    
    // Generate task-based recommendations
    if (parsedContent.tasks.length > 0) {
      // Recommend breaking down large tasks
      const largeTasks = parsedContent.tasks.filter(task => 
        task.estimatedDuration && task.estimatedDuration >= 150);
      
      if (largeTasks.length > 0) {
        recommendations.push({
          type: "task",
          content: `Consider breaking down ${largeTasks.length} complex tasks into smaller components for better tracking`,
          priority: "medium",
          impact: 70,
          timestamp: Date.now()
        });
      }
      
      // Recommend skill development based on task content
      const skills = extractSkillsFromTasks(parsedContent.tasks);
      if (skills.length > 0) {
        recommendations.push({
          type: "learning",
          content: `Based on upcoming tasks, developing skills in ${skills.join(", ")} would be beneficial`,
          priority: "medium",
          impact: 60,
          timestamp: Date.now()
        });
      }
    }
    
    // Add time management recommendation
    recommendations.push({
      type: "efficiency",
      content: "Set up time tracking for these new tasks to optimize your productivity",
      priority: "medium",
      impact: 65,
      timestamp: Date.now(),
      actualDuration: 10
    });
    
    return {
      recommendations,
      tasks: parsedContent.tasks,
      metadata: {
        keyInsights: generateKeyInsights(content),
        suggestedSkills: extractSkillsFromTasks(parsedContent.tasks),
        estimatedEffort: parsedContent.tasks.reduce((sum, task) => 
          sum + (task.estimatedDuration || 0), 0)
      }
    };
  } catch (error) {
    console.error("Error in AI document analysis:", error);
    return {
      recommendations: [],
      tasks: [],
      metadata: {
        keyInsights: [],
        suggestedSkills: [],
        estimatedEffort: 0
      }
    };
  }
};

/**
 * Extracts potentially required skills from task content
 */
const extractSkillsFromTasks = (tasks: Partial<Task>[]): string[] => {
  const skillKeywords: Record<string, string[]> = {
    "frontend": ["ui", "interface", "react", "css", "html", "component", "design"],
    "backend": ["api", "database", "server", "endpoint", "service"],
    "data": ["analysis", "visualization", "report", "metric", "dashboard"],
    "content": ["writing", "documentation", "article", "blog", "communication"]
  };
  
  const identifiedSkills = new Set<string>();
  
  tasks.forEach(task => {
    const content = `${task.title} ${task.description}`.toLowerCase();
    
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        identifiedSkills.add(skill);
      }
    });
  });
  
  return Array.from(identifiedSkills);
};

/**
 * Generates key insights from document content
 */
const generateKeyInsights = (content: string): string[] => {
  const insights: string[] = [];
  
  // Look for important sections
  if (content.toLowerCase().includes("objective") || content.toLowerCase().includes("goal")) {
    insights.push("Document contains clear objectives/goals");
  }
  
  if (content.toLowerCase().includes("deadline") || content.toLowerCase().includes("due date")) {
    insights.push("Time-sensitive deliverables identified");
  }
  
  if (content.toLowerCase().includes("requirement")) {
    insights.push("Requirements specification included");
  }
  
  // Add default insight if none found
  if (insights.length === 0) {
    insights.push("General project documentation");
  }
  
  return insights;
};
