
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Portfolio, LinkedInSuggestion, LinkedInGroup } from "@/types/portfolio";
import {
  suggestRelevantConnections,
  findRelevantGroups,
  formatLinkedInPost
} from "@/utils/linkedInUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkedInIntegrationProps {
  portfolio: Portfolio;
}

export function LinkedInIntegration({ portfolio }: LinkedInIntegrationProps) {
  const { toast } = useToast();

  const { data: connections } = useQuery({
    queryKey: ["linkedin-connections", portfolio.userId],
    queryFn: () => suggestRelevantConnections(portfolio),
  });

  const { data: groups } = useQuery({
    queryKey: ["linkedin-groups", portfolio.userId],
    queryFn: () => findRelevantGroups(portfolio),
  });

  const formattedPost = formatLinkedInPost(portfolio);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this content on LinkedIn",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suggested Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {connections?.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{connection.name}</h4>
                    <p className="text-sm text-muted-foreground">{connection.title}</p>
                    <div className="flex gap-2 mt-2">
                      {connection.matchedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge>{connection.connectionDegree}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {groups?.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{group.name}</h4>
                    <Badge variant="secondary">
                      {group.memberCount.toLocaleString()} members
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {group.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {group.matchedKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Post Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 space-y-4 border rounded-lg">
            <h3 className="text-lg font-semibold">{formattedPost.title}</h3>
            <p className="whitespace-pre-wrap">{formattedPost.content}</p>
            <div className="flex flex-wrap gap-2">
              {formattedPost.hashtags.map((hashtag) => (
                <Badge key={hashtag} variant="secondary">
                  {hashtag}
                </Badge>
              ))}
            </div>
            <Button
              className="mt-4"
              onClick={() => copyToClipboard(`${formattedPost.title}\n\n${formattedPost.content}\n\n${formattedPost.hashtags.join(' ')}`)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

