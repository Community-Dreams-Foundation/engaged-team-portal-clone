
import { Card } from "@/components/ui/card"
import { PortfolioPreview } from "@/components/dashboard/portfolio/PortfolioPreview"
import { GitHubPortfolioPreview } from "@/components/dashboard/portfolio/GitHubPortfolioPreview"
import { LinkedInIntegration } from "@/components/dashboard/portfolio/LinkedInIntegration"
import type { Portfolio } from "@/types/portfolio"
import type { GitHubContent } from "@/types/portfolio"

interface PortfolioSectionProps {
  portfolio: Portfolio;
  githubContent: GitHubContent;
}

export function PortfolioSection({ portfolio, githubContent }: PortfolioSectionProps) {
  return (
    <div className="col-span-full lg:col-span-2 space-y-4">
      <Card className="p-6">
        <PortfolioPreview portfolio={portfolio} />
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <GitHubPortfolioPreview 
            content={githubContent}
            onSave={() => Promise.resolve()}
          />
        </Card>
        <Card className="p-6">
          <LinkedInIntegration portfolio={portfolio} />
        </Card>
      </div>
    </div>
  );
}

