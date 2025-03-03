
import { Task } from "@/types/task";
import { DomainCategory } from "./types";

// Generate tasks from documents
export const generateTasksFromDocuments = (
  documents: Record<string, string>,
  domain: DomainCategory
): Partial<Task>[] => {
  const tasks: Partial<Task>[] = [];
  
  // Create a task for each document
  Object.entries(documents).forEach(([docType, content]) => {
    // Extract potential tasks from document content using regex
    const taskLines = content.match(/(?:^|\n)[-*] (.+?)(?:\n|$)/g) || [];
    
    // Create tasks from bullet points
    taskLines.forEach((line, index) => {
      const taskContent = line.replace(/^[-*] /, '').trim();
      if (taskContent) {
        tasks.push({
          title: `[${domain}] ${docType} - ${taskContent}`,
          description: `Task extracted from ${docType} document for ${domain} domain.`,
          status: "todo",
          estimatedDuration: 60, // Default 1 hour
          actualDuration: 0,
          priority: "medium",
          tags: [domain, docType],
          metadata: {
            complexity: "medium",
            impact: "medium",
            businessValue: 7,
            learningOpportunity: 5,
            domain: domain
          }
        });
      }
    });

    // Create a document review task
    tasks.push({
      title: `Review ${docType.replace(/-/g, " ")} for ${domain} domain`,
      description: `Review and approve the ${docType.replace(/-/g, " ")} document for the ${domain} domain.`,
      status: "todo",
      estimatedDuration: 30, // 30 minutes for review
      actualDuration: 0,
      priority: "high",
      tags: [domain, docType, "review"],
      metadata: {
        complexity: "low",
        impact: "high",
        businessValue: 8,
        learningOpportunity: 4,
        domain: domain
      }
    });
  });
  
  return tasks;
};
