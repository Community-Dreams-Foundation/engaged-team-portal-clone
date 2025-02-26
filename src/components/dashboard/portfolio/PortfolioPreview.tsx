
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Share2, Award, Briefcase } from "lucide-react"
import { ProjectHighlights } from "./ProjectHighlights"
import { ImpactMetrics } from "./ImpactMetrics"
import { VisualSummary } from "./VisualSummary"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PortfolioTemplate } from "./PortfolioTemplate"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
          <span>Professional Portfolio</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              disabled={isSharing}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Share to LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('github')}
              disabled={isSharing}
            >
              <Github className="h-4 w-4 mr-2" />
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">
              <Briefcase className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <PortfolioTemplate portfolio={portfolio} />
            <ProjectHighlights items={portfolio.items} />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4 space-y-4">
            <ImpactMetrics summary={portfolio.summary} />
            <VisualSummary data={portfolio.items} />
          </TabsContent>
          
          <TabsContent value="certifications" className="mt-4">
            <Card className="p-4">
              <div className="text-center text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-2" />
                <p>Professional certification tracking coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
