
import { documentTitles, documentDescriptions } from "@/components/intake/DocumentConstants";
import { Task, SkillLevel } from "@/types/task";

// Define domain categories
export type DomainCategory = "strategy" | "data-engineering" | "frontend" | "product-design" | "engagement";

// Standard document types that should be created for every domain
export type StandardDocumentType = "project-charter" | "prd" | "execution-calendar" | "sprint-plan";

// Domain-specific document mapping
export const domainSpecificDocuments: Record<DomainCategory, string[]> = {
  "strategy": ["market-analysis", "competitive-landscape", "strategic-roadmap"],
  "data-engineering": ["data-schema", "etl-workflow", "data-governance-plan"],
  "frontend": ["ui-mockups", "component-library", "accessibility-guidelines"],
  "product-design": ["design-system", "user-flow", "ux-research-findings"],
  "engagement": ["communication-plan", "stakeholder-matrix", "client-feedback-process"]
};

// Generate standard documents for a domain
export const generateStandardDocument = (
  documentType: StandardDocumentType,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): string => {
  switch (documentType) {
    case "project-charter":
      return `# Project Charter: ${projectTitle}

## Overview
${projectDescription}

## Objectives
- Successfully implement the ${projectTitle} project
- Deliver key functionalities on time
- Ensure high quality and reliability

## Timeline
Deadline: ${deadline}

## Priority
${priority.toUpperCase()}

## Stakeholders
- Project Manager
- Development Team
- QA Team
- Business Stakeholders

## Success Criteria
- All features implemented according to specifications
- Passing all quality assurance tests
- Meeting the deadline of ${deadline}
`;

    case "prd":
      return `# Product Requirements Document: ${projectTitle}

## Introduction
${projectDescription}

## Problem Statement
This project aims to address key challenges in our current workflow and improve overall efficiency.

## User Stories
1. As a user, I want to easily navigate the interface
2. As a user, I want to efficiently complete my tasks
3. As a user, I want to track my progress

## Requirements
### Functional Requirements
- Implement core functionality
- Create intuitive user interface
- Ensure data persistence

### Non-functional Requirements
- Performance: System should respond within 2 seconds
- Scalability: Support up to 1000 concurrent users
- Security: Implement proper authentication and authorization

## Timeline
Deadline: ${deadline}
Priority: ${priority.toUpperCase()}
`;

    case "execution-calendar":
      return `# 10-Day Execution Calendar: ${projectTitle}

## Overview
This calendar outlines the key milestones and deliverables for the next 10 working days.

## Priority
${priority.toUpperCase()}

## Timeline
Final Deadline: ${deadline}

## Daily Schedule

### Day 1
- Project kickoff meeting
- Define detailed requirements
- Set up development environment

### Day 2
- Backend architecture design
- Database schema creation
- API endpoint planning

### Day 3
- Frontend component design
- UI/UX wireframing
- Initial backend implementation

### Day 4-5
- Core functionality development
- Database integration
- API implementation

### Day 6-7
- Frontend implementation
- Integration with backend
- Initial testing

### Day 8
- Bug fixes and refinements
- Performance optimization
- User acceptance testing preparation

### Day 9
- User acceptance testing
- Documentation
- Final adjustments

### Day 10
- Final QA checks
- Deployment preparation
- Project handover
`;

    case "sprint-plan":
      return `# Sprint Plan: ${projectTitle}

## Sprint Goal
Deliver a working prototype of ${projectTitle} with core functionality.

## Project Overview
${projectDescription}

## Priority
${priority.toUpperCase()}

## Timeline
Sprint End Date: ${deadline}

## User Stories
- Implement user authentication
- Create main dashboard interface
- Develop core functionality modules
- Implement data persistence layer
- Create reporting functionality

## Tasks Breakdown
- Set up project repository and development environments
- Create database schema and migrations
- Implement authentication services
- Design and implement UI components
- Integrate frontend with backend services
- Implement automated tests
- Conduct code reviews
- Document APIs and components

## Team Allocation
- 2 Frontend Developers
- 2 Backend Developers
- 1 QA Engineer
- 1 Product Manager

## Definition of Done
- Code is completed and reviewed
- Tests are written and passing
- Documentation is updated
- Feature is deployed to staging environment
- QA approval is obtained
`;
    
    default:
      return `# ${documentType}: ${projectTitle}\n\n${projectDescription}\n\nPriority: ${priority}\nDeadline: ${deadline}`;
  }
};

// Generate domain-specific document
export const generateDomainSpecificDocument = (
  domain: DomainCategory,
  documentType: string,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): string => {
  // Common header format for all domain-specific documents
  const header = `# ${documentType.charAt(0).toUpperCase() + documentType.slice(1).replace(/-/g, " ")}: ${projectTitle}

## Domain: ${domain.charAt(0).toUpperCase() + domain.slice(1).replace(/-/g, " ")}
## Overview
${projectDescription}

## Priority
${priority.toUpperCase()}

## Timeline
Deadline: ${deadline}

`;

  // Custom content based on domain and document type
  let content = "";
  
  if (domain === "strategy") {
    if (documentType === "market-analysis") {
      content = `## Market Analysis
- Current market size and trends
- Competitor landscape
- Target audience demographics
- Growth opportunities
- Potential challenges

## Recommendations
- Key strategic initiatives
- Market positioning
- Growth strategy
- Resource allocation
`;
    } else if (documentType === "competitive-landscape") {
      content = `## Competitors
- Direct competitors
- Indirect competitors
- Strengths and weaknesses analysis
- Market share distribution
- Competitive advantages

## Differentiation Strategy
- Unique value propositions
- Feature comparison
- Pricing strategy
- Market positioning
`;
    } else if (documentType === "strategic-roadmap") {
      content = `## Strategic Goals
- Short-term objectives (3 months)
- Medium-term objectives (6-12 months)
- Long-term vision (1-3 years)

## Key Milestones
- Phase 1: Initial market entry
- Phase 2: Market expansion
- Phase 3: Diversification
- Phase 4: Optimization and scaling

## Resource Requirements
- Team composition
- Budget allocation
- Technology stack
- Third-party partnerships
`;
    }
  } else if (domain === "data-engineering") {
    if (documentType === "data-schema") {
      content = `## Data Models
- Entity relationships
- Attribute definitions
- Data types and constraints
- Indexing strategy

## Schema Design
- Normalization level
- Partitioning strategy
- Scalability considerations
- Migration path
`;
    } else if (documentType === "etl-workflow") {
      content = `## ETL Processes
- Data sources
- Extraction methods
- Transformation rules
- Loading procedures
- Scheduling and frequency

## Data Quality
- Validation rules
- Error handling
- Data cleansing procedures
- Monitoring metrics
`;
    } else if (documentType === "data-governance-plan") {
      content = `## Governance Framework
- Data ownership
- Access controls
- Compliance requirements
- Retention policies
- Audit procedures

## Data Security
- Encryption methods
- Anonymization procedures
- Access logs
- Vulnerability assessment
`;
    }
  } else if (domain === "engagement") {
    if (documentType === "communication-plan") {
      content = `## Communication Channels
- Primary and secondary channels
- Communication frequency
- Escalation pathways
- Reporting structure

## Stakeholder Engagement
- Communication templates
- Meeting schedules
- Status reporting cadence
- Feedback mechanisms
`;
    } else if (documentType === "stakeholder-matrix") {
      content = `## Key Stakeholders
- Decision makers
- Influencers
- End users
- Technical teams
- Support teams

## Engagement Strategy
- Stakeholder needs and expectations
- Communication preferences
- Engagement frequency
- Success metrics
`;
    } else if (documentType === "client-feedback-process") {
      content = `## Feedback Collection
- Feedback channels
- Survey methodology
- Interview process
- Metrics tracking

## Implementation Process
- Feedback prioritization
- Action item assignment
- Implementation timeline
- Success validation
`;
    }
  } else if (domain === "frontend" || domain === "product-design") {
    // Generic content for other domains if specific content not defined
    content = `## Key Components
- Component 1: Description and requirements
- Component 2: Description and requirements
- Component 3: Description and requirements

## Implementation Details
- Technical approach
- Libraries and frameworks
- Integration points
- Performance considerations

## Testing Strategy
- Unit testing approach
- Integration testing plan
- User acceptance criteria
- Performance benchmarks

## Risks and Mitigations
- Identified risks
- Mitigation strategies
- Contingency plans
`;
  }

  return header + content;
};

// Create all standard documents for a domain
export const createAllStandardDocuments = (
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): Record<StandardDocumentType, string> => {
  return {
    "project-charter": generateStandardDocument("project-charter", projectTitle, projectDescription, priority, deadline),
    "prd": generateStandardDocument("prd", projectTitle, projectDescription, priority, deadline),
    "execution-calendar": generateStandardDocument("execution-calendar", projectTitle, projectDescription, priority, deadline),
    "sprint-plan": generateStandardDocument("sprint-plan", projectTitle, projectDescription, priority, deadline)
  };
};

// Create all domain-specific documents for a domain
export const createDomainSpecificDocuments = (
  domain: DomainCategory,
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): Record<string, string> => {
  const documents: Record<string, string> = {};
  
  const documentTypes = domainSpecificDocuments[domain] || [];
  
  documentTypes.forEach(documentType => {
    documents[documentType] = generateDomainSpecificDocument(
      domain,
      documentType,
      projectTitle,
      projectDescription,
      priority,
      deadline
    );
  });
  
  return documents;
};

// Generate tasks from documents
export const generateTasksFromDocuments = (
  documents: Record<string, string>,
  domain: DomainCategory
): Partial<Task>[] => {
  const tasks: Partial<Task>[] = [];
  
  // Create a task for each standard document
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
            learningOpportunity: 5, // Add missing required field
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
        learningOpportunity: 4, // Add missing required field
        domain: domain
      }
    });
  });
  
  return tasks;
};

// Generate full project documentation and tasks across all domains
export const generateFullProjectDocumentation = (
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): { documents: Record<string, Record<string, string>>, tasks: Partial<Task>[] } => {
  const allDomains: DomainCategory[] = ["strategy", "data-engineering", "frontend", "product-design", "engagement"];
  const allDocuments: Record<string, Record<string, string>> = {};
  let allTasks: Partial<Task>[] = [];
  
  // Generate standard documents (common for the project)
  const standardDocs = createAllStandardDocuments(
    projectTitle,
    projectDescription, 
    priority,
    deadline
  );
  
  allDocuments["standard"] = standardDocs;
  
  // Generate domain-specific documents and tasks for each domain
  allDomains.forEach(domain => {
    // Generate domain-specific documents
    const domainDocs = createDomainSpecificDocuments(
      domain,
      projectTitle,
      projectDescription,
      priority,
      deadline
    );
    
    // Store domain documents
    allDocuments[domain] = domainDocs;
    
    // Generate tasks from domain documents
    const domainTasks = generateTasksFromDocuments(domainDocs, domain);
    
    // Add tasks to overall list
    allTasks = [...allTasks, ...domainTasks];
  });
  
  // Generate tasks from standard documents (assign them to strategy domain for simplicity)
  const standardTasks = generateTasksFromDocuments(standardDocs, "strategy");
  allTasks = [...allTasks, ...standardTasks];
  
  return {
    documents: allDocuments,
    tasks: allTasks
  };
};
