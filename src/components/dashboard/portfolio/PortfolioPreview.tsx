
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Share2 } from "lucide-react"
import { ProjectHighlights } from "./ProjectHighlights"
import { ImpactMetrics } from "./ImpactMetrics"
import { VisualSummary } from "./VisualSummary"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PortfolioTemplate } from "./PortfolioTemplate"
import type { Portfolio } from "@/types/portfolio"

interface PortfolioPreviewProps {
  portfolio: Portfolio;
  onShare?: (platform: 'linkedin' | 'github') => Promise<void>;
}

export function PortfolioPreview({ portfolio, onShare }: PortfolioPreviewProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleShare = async (platform: 'linkedin' | 'github') => {
    try {
      setIsSharing(true)
      await onShare?.(platform)
      toast({
        title: "Portfolio shared successfully",
        description: `Your portfolio has been shared to ${platform === 'linkedin' ? 'LinkedIn' : 'GitHub'}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sharing portfolio",
        description: "There was an error sharing your portfolio. Please try again.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Portfolio Preview</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              disabled={isSharing}
            >
              <Linkedin className="h-4 w-4" />
              Share to LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('github')}
              disabled={isSharing}
            >
              <Github className="h-4 w-4" />
              Export to GitHub
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share Link
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PortfolioTemplate portfolio={portfolio} />
        <ProjectHighlights items={portfolio.items} />
        <ImpactMetrics summary={portfolio.summary} />
        <VisualSummary data={portfolio.items} />
      </CardContent>
    </Card>
  )
}
