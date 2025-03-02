
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, CheckCircle2, XCircle } from "lucide-react";
import { LeadershipTier, LeadershipDomain } from '@/types/leadership';
import { useToast } from "@/hooks/use-toast";

const tierNames: Record<LeadershipTier, string> = {
  "emerging": "Emerging Leader",
  "captain": "Captain",
  "team-lead": "Team Lead",
  "product-owner": "Product Owner",
  "executive": "Executive"
};

const tierColors: Record<LeadershipTier, string> = {
  "emerging": "bg-blue-500",
  "captain": "bg-green-500",
  "team-lead": "bg-purple-500",
  "product-owner": "bg-orange-500",
  "executive": "bg-red-500"
};

interface PromotionRequirementsProps {
  currentTier: LeadershipTier;
  nextTier: LeadershipTier;
  requirements: {
    minimumMetrics: {
      overallScore: number;
      teamEfficiency?: number;
      mentorshipScore?: number;
      communicationScore?: number;
      innovationScore?: number;
    };
    trainingModules: string[];
    timeInCurrentTier: number; // in days
    mentorshipRequired: boolean;
  };
  currentMetrics: {
    overallScore: number;
    teamEfficiency?: number;
    mentorshipScore?: number;
    communicationScore?: number;
    innovationScore?: number;
    daysInCurrentTier: number;
    completedModules: string[];
    hasMentor: boolean;
  };
  onRequestPromotion: () => void;
}

export function PromotionRequirements({ 
  currentTier, 
  nextTier, 
  requirements, 
  currentMetrics,
  onRequestPromotion
}: PromotionRequirementsProps) {
  const { toast } = useToast();
  
  const isEligible = 
    currentMetrics.overallScore >= requirements.minimumMetrics.overallScore &&
    currentMetrics.daysInCurrentTier >= requirements.timeInCurrentTier &&
    (!requirements.mentorshipRequired || currentMetrics.hasMentor) &&
    requirements.trainingModules.every(module => 
      currentMetrics.completedModules.includes(module)
    );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Promotion Requirements</CardTitle>
            <CardDescription>
              Requirements to be promoted from {tierNames[currentTier]} to {tierNames[nextTier]}
            </CardDescription>
          </div>
          <Badge className={`${tierColors[nextTier]} text-white`}>
            {tierNames[nextTier]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm text-muted-foreground">
                {currentMetrics.overallScore}/{requirements.minimumMetrics.overallScore}
              </span>
            </div>
            <Progress 
              value={(currentMetrics.overallScore / requirements.minimumMetrics.overallScore) * 100} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Time in Current Role</span>
              <span className="text-sm text-muted-foreground">
                {currentMetrics.daysInCurrentTier}/{requirements.timeInCurrentTier} days
              </span>
            </div>
            <Progress 
              value={(currentMetrics.daysInCurrentTier / requirements.timeInCurrentTier) * 100} 
              className="h-2"
            />
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-3">Required Training</h4>
          <div className="space-y-2">
            {requirements.trainingModules.map((module, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-muted-foreground" />
                  <span>{module}</span>
                </div>
                {currentMetrics.completedModules.includes(module) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {requirements.mentorshipRequired && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div>
              <h4 className="text-sm font-medium">Mentorship Requirement</h4>
              <p className="text-sm text-muted-foreground">Must have an active mentor</p>
            </div>
            {currentMetrics.hasMentor ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        )}
        
        <Button 
          className="w-full" 
          disabled={!isEligible}
          onClick={onRequestPromotion}
        >
          {isEligible ? 'Request Promotion' : 'Not Eligible Yet'}
        </Button>
      </CardContent>
    </Card>
  );
}
