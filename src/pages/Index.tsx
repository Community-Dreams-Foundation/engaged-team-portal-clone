
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TrainingModules } from "@/components/dashboard/TrainingModules"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { CommunicationFeed } from "@/components/dashboard/CommunicationFeed"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { TieredSupport } from "@/components/support/TieredSupport"
import { KnowledgeGraph } from "@/components/dashboard/cos-agent/KnowledgeGraph"
import { RecruitmentFunnel } from "@/components/dashboard/cos-agent/RecruitmentFunnel"
import { GitHubPortfolioPreview } from "@/components/dashboard/portfolio/GitHubPortfolioPreview"
import { LinkedInIntegration } from "@/components/dashboard/portfolio/LinkedInIntegration"
import { PortfolioPreview } from "@/components/dashboard/portfolio/PortfolioPreview"
import { Card } from "@/components/ui/card"

export default function Index() {
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
          target: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days from now
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
          target: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days from now
        }
      }
    ],
    metrics: {
      totalApplications: 5,
      activeProcesses: 2,
      successRate: 0.75,
      averageTimeToOffer: 1209600000 // 14 days in milliseconds
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

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Kanban Board Section */}
        <div className="col-span-full">
          <Card className="p-6">
            <KanbanBoard />
          </Card>
        </div>

        {/* CoS Agent and Knowledge Section */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-6">
            <TrainingModules />
          </Card>
          <Card className="p-6">
            <KnowledgeGraph data={mockKnowledgeData} />
          </Card>
        </div>

        {/* Performance and Portfolio Section */}
        <div className="space-y-4">
          <CosAgent />
          <Card className="p-6">
            <PerformanceMetrics />
          </Card>
          <Card className="p-6">
            <RecruitmentFunnel data={mockRecruitmentData} />
          </Card>
        </div>

        {/* Portfolio Integration Section */}
        <div className="col-span-full lg:col-span-2 space-y-4">
          <Card className="p-6">
            <PortfolioPreview portfolio={mockPortfolio} />
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6">
              <GitHubPortfolioPreview 
                content={mockGithubContent}
                onSave={() => Promise.resolve()}
              />
            </Card>
            <Card className="p-6">
              <LinkedInIntegration portfolio={mockPortfolio} />
            </Card>
          </div>
        </div>

        {/* Support and Communication Section */}
        <div className="col-span-full">
          <Card className="p-6">
            <TieredSupport />
          </Card>
        </div>

        {/* Communication Feed */}
        <div className="col-span-full lg:col-span-2">
          <Card className="p-6">
            <CommunicationFeed />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

