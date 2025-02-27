
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { KanbanSection } from "@/components/dashboard/sections/KanbanSection"
import { TrainingSection } from "@/components/dashboard/sections/TrainingSection"
import { PerformanceSection } from "@/components/dashboard/sections/PerformanceSection"
import { CommunitySection } from "@/components/dashboard/sections/CommunitySection"
import { PortfolioSection } from "@/components/dashboard/sections/PortfolioSection"
import { SupportSection } from "@/components/dashboard/sections/SupportSection"

// Mock data imports
const mockKnowledgeData = {
  nodes: [
    { 
      id: "1", 
      title: "Project Management",
      type: "skill" as const,
      description: "Project management expertise",
      tags: ["management", "leadership"],
      connections: ["2", "3"],
      strength: 0.8,
      lastUpdated: new Date().getTime(),
      category: "professional",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    },
    { 
      id: "2", 
      title: "Team Leadership",
      type: "skill" as const,
      description: "Team leadership experience",
      tags: ["leadership", "communication"],
      connections: ["1", "3"],
      strength: 0.9,
      lastUpdated: new Date().getTime(),
      category: "professional",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    },
    { 
      id: "3", 
      title: "Recent Project",
      type: "project" as const,
      description: "Latest project completion",
      tags: ["project", "achievement"],
      connections: ["1", "2"],
      strength: 0.7,
      lastUpdated: new Date().getTime(),
      category: "experience",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    }
  ],
  edges: [
    { source: "1", target: "3", type: "created" as const, strength: 2 },
    { source: "2", target: "3", type: "created" as const, strength: 1 }
  ]
};

const mockRecruitmentData = {
  stages: [
    {
      id: "research",
      name: "Research",
      companies: [
        { 
          id: "1", 
          name: "Tech Corp", 
          status: "researching" as const,
          probability: 0.7,
          lastContact: Date.now(),
          notes: "Initial research phase",
          nextSteps: "Schedule initial call"
        }
      ],
      requirements: ["Resume", "Portfolio"],
      timeline: {
        start: Date.now(),
        target: Date.now() + 7 * 24 * 60 * 60 * 1000
      }
    },
    {
      id: "applied",
      name: "Applied",
      companies: [
        { 
          id: "2", 
          name: "Innovation Inc", 
          status: "applied" as const,
          probability: 0.8,
          lastContact: Date.now(),
          notes: "Application submitted",
          nextSteps: "Follow up next week"
        }
      ],
      requirements: ["Interview", "Technical Test"],
      timeline: {
        start: Date.now(),
        target: Date.now() + 14 * 24 * 60 * 60 * 1000
      }
    }
  ],
  metrics: {
    totalApplications: 5,
    activeProcesses: 2,
    successRate: 0.75,
    averageTimeToOffer: 1209600000
  }
};

const mockPortfolio = {
  userId: "user123",
  metadata: {
    title: "John Doe's Portfolio",
    description: "Software Engineer Portfolio",
    lastUpdated: Date.now(),
    format: "website" as const,
    visibility: "public" as const
  },
  items: [],
  metrics: {
    tasksCompleted: 150,
    efficiency: 0.85,
    timesSaved: 120,
    impactScore: 92
  },
  preferences: {
    template: "default" as const,
    primaryColor: "#3b82f6",
    showMetrics: true,
    selectedItems: []
  },
  summary: {
    totalProjects: 15,
    avgEfficiency: 0.85,
    topSkills: ["React", "TypeScript", "Node.js"],
    overallImpact: {
      tasksCompleted: 150,
      efficiencyImprovement: 0.25,
      timesSaved: 120
    }
  }
};

const mockGithubContent = {
  readmeContent: "# Portfolio\nWelcome to my portfolio",
  portfolioPage: "<html><body>Portfolio Page</body></html>",
  repositoryName: "portfolio",
  commitMessage: "Update portfolio"
};

const mockChallenges = [
  {
    id: "1",
    title: "Sprint Excellence Challenge",
    description: "Complete all sprint tasks before deadline with high quality",
    type: "team" as const,
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    participants: ["user1", "user2"],
    teamSize: 5,
    rewards: {
      tier: "gold" as const,
      points: 1000,
      badges: ["Sprint Champion"]
    },
    objectives: [
      {
        id: "obj1",
        description: "Complete 20 tasks",
        progress: 8,
        target: 20,
        completed: false
      },
      {
        id: "obj2",
        description: "Maintain 90% quality score",
        progress: 85,
        target: 90,
        completed: false
      }
    ],
    status: "active" as const
  }
];

const mockVisaStatus = {
  type: "H-1B",
  expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
  remainingDays: 180,
  documents: [
    {
      name: "Work Authorization",
      status: "valid" as const,
      expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
      category: "primary" as const,
      uploadedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      fileUrl: "/documents/work-auth.pdf",
      notes: "Original document issued by USCIS"
    },
    {
      name: "Passport",
      status: "expiring" as const,
      expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      category: "primary" as const,
      uploadedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      fileUrl: "/documents/passport.pdf"
    }
  ],
  nextSteps: [
    {
      id: "step1",
      description: "Submit I-765 form for EAD renewal",
      deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
      completed: false,
      requiredDocuments: ["Passport", "I-94", "Previous EAD"]
    },
    {
      id: "step2",
      description: "Schedule biometrics appointment",
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
      completed: false
    }
  ]
};

export default function Index() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KanbanSection />
        <TrainingSection 
          knowledgeData={mockKnowledgeData}
          challenges={mockChallenges}
        />
        <PerformanceSection 
          recruitmentData={mockRecruitmentData}
          visaStatus={mockVisaStatus}
        />
        <CommunitySection />
        <PortfolioSection portfolio={mockPortfolio} />
        <SupportSection />
      </div>
    </DashboardLayout>
  );
}
