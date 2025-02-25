
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
        type: "skill",
        description: "Project management expertise",
        tags: ["management", "leadership"],
        connections: ["2", "3"],
        strength: 0.8,
        lastUpdated: new Date(),
        category: "professional"
      },
      { 
        id: "2", 
        title: "Team Leadership",
        type: "skill",
        description: "Team leadership experience",
        tags: ["leadership", "communication"],
        connections: ["1", "3"],
        strength: 0.9,
        lastUpdated: new Date(),
        category: "professional"
      },
      { 
        id: "3", 
        title: "Recent Project",
        type: "project",
        description: "Latest project completion",
        tags: ["project", "achievement"],
        connections: ["1", "2"],
        strength: 0.7,
        lastUpdated: new Date(),
        category: "experience"
      },
      { 
        id: "4", 
        title: "Strategic Planning",
        type: "experience",
        description: "Strategic planning skills",
        tags: ["strategy", "planning"],
        connections: ["1"],
        strength: 0.85,
        lastUpdated: new Date(),
        category: "professional"
      }
    ],
    edges: [
      { source: "1", target: "3", strength: 2 },
      { source: "2", target: "3", strength: 1 },
      { source: "4", target: "1", strength: 3 }
    ]
  };

  const mockRecruitmentData = {
    stages: [
      {
        id: "research",
        name: "Research",
        companies: [
          { id: "1", name: "Tech Corp", status: "researching", probability: 0.7 }
        ],
        requirements: ["Resume", "Portfolio"],
        timeline: "1 week"
      },
      {
        id: "applied",
        name: "Applied",
        companies: [
          { id: "2", name: "Innovation Inc", status: "applied", probability: 0.8 }
        ],
        requirements: ["Interview", "Technical Test"],
        timeline: "2 weeks"
      }
    ],
    metrics: {
      activeProcesses: 2,
      successRate: 0.75,
      averageTimeToOffer: 1209600000 // 14 days in milliseconds
    }
  };

  const mockPortfolio = {
    name: "John Doe",
    title: "Software Engineer",
    description: "Experienced software engineer with a focus on web development",
    projects: [],
    skills: [],
    experience: [],
    contact: {
      email: "john@example.com",
      linkedin: "johndoe",
      github: "johndoe"
    }
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
                content={mockPortfolio}
                onSave={() => console.log("Saving GitHub portfolio...")}
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
