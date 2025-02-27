
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { PortfolioPreview } from "@/components/dashboard/portfolio/PortfolioPreview"
import { GitHubPortfolioPreview } from "@/components/dashboard/portfolio/GitHubPortfolioPreview"
import { LinkedInIntegration } from "@/components/dashboard/portfolio/LinkedInIntegration"
import { GitHubService } from "@/services/GitHubService"
import { useToast } from "@/components/ui/use-toast"
import type { Portfolio } from "@/types/portfolio"
import type { GitHubContent } from "@/types/portfolio"

interface PortfolioSectionProps {
  portfolio: Portfolio;
  githubContent?: GitHubContent;
}

export function PortfolioSection({ portfolio, githubContent: initialGithubContent }: PortfolioSectionProps) {
  const [githubContent, setGithubContent] = useState<GitHubContent | null>(initialGithubContent || null);
  const { toast } = useToast();
  const githubService = new GitHubService();

  useEffect(() => {
    const fetchGitHubContent = async () => {
      try {
        // Replace with actual GitHub username and repo
        const content = await githubService.getPortfolioContent("your-username", "portfolio");
        setGithubContent(content);
      } catch (error) {
        console.error("Error fetching GitHub content:", error);
        toast({
          variant: "destructive",
          title: "Error fetching GitHub content",
          description: "Please check your GitHub credentials and try again."
        });
      }
    };

    if (!initialGithubContent) {
      fetchGitHubContent();
    }
  }, [initialGithubContent]);

  const handleSave = async () => {
    try {
      // Implement GitHub save functionality here
      toast({
        title: "Changes saved",
        description: "Your portfolio has been updated on GitHub."
      });
    } catch (error) {
      console.error("Error saving to GitHub:", error);
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: "Failed to save changes to GitHub. Please try again."
      });
    }
  };

  return (
    <div className="col-span-full lg:col-span-2 space-y-4">
      <Card className="p-6">
        <PortfolioPreview portfolio={portfolio} />
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <GitHubPortfolioPreview 
            content={githubContent || {
              readmeContent: "Loading GitHub content...",
              portfolioPage: "<p>Loading...</p>",
              repositoryName: "",
              commitMessage: ""
            }}
            onSave={handleSave}
          />
        </Card>
        <Card className="p-6">
          <LinkedInIntegration portfolio={portfolio} />
        </Card>
      </div>
    </div>
  );
}

