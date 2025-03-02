
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDatabase, ref, get, update } from "firebase/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeadershipMetrics } from "@/components/leadership/LeadershipMetrics";
import { LeadershipProgressChart } from "@/components/leadership/LeadershipProgressChart";
import { PromotionRequirements } from "@/components/leadership/PromotionRequirements";
import { MentorshipConnection } from "@/components/leadership/MentorshipConnection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LeadershipProfile, LeadershipTier } from "@/types/leadership";
import { Shield, Target, Users } from "lucide-react";

// Helper function to get next tier
const getNextTier = (currentTier: LeadershipTier): LeadershipTier => {
  const tiers: LeadershipTier[] = ["emerging", "captain", "team-lead", "product-owner", "executive"];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier;
};

export const LeadershipTabContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch leadership profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['leadershipProfile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      const db = getDatabase();
      const profileRef = ref(db, `users/${currentUser.uid}/leadership`);
      const snapshot = await get(profileRef);
      return snapshot.exists() ? snapshot.val() as LeadershipProfile : null;
    },
    enabled: !!currentUser,
  });

  const nextTier = profile ? getNextTier(profile.currentTier) : "captain";
  
  // Mock promotion requirements
  const mockRequirements = {
    minimumMetrics: {
      overallScore: 75,
      teamEfficiency: 70,
      mentorshipScore: 65,
      communicationScore: 80,
    },
    trainingModules: [
      "Leadership Fundamentals",
      "Effective Communication",
      "Team Building"
    ],
    timeInCurrentTier: 90, // 90 days
    mentorshipRequired: true
  };
  
  // Mock current metrics for promotion
  const mockCurrentMetrics = {
    overallScore: profile?.metrics?.overallScore || 65,
    teamEfficiency: profile?.metrics?.teamEfficiency || 60,
    mentorshipScore: profile?.metrics?.mentorshipScore || 50,
    communicationScore: profile?.metrics?.communicationScore || 70,
    daysInCurrentTier: 45,
    completedModules: ["Leadership Fundamentals", "Effective Communication"],
    hasMentor: profile?.mentors?.length > 0
  };
  
  const handleRequestPromotion = () => {
    toast({
      title: "Promotion request submitted",
      description: "Your request has been submitted for review",
    });
  };
  
  const handleUpdateMentorshipPreferences = async (preferences: {
    availableAsMentor?: boolean;
    seekingMentor?: boolean;
    preferredMentorshipAreas?: string[];
  }) => {
    if (!currentUser?.uid || !profile) return;
    
    try {
      const db = getDatabase();
      const preferencesRef = ref(db, `users/${currentUser.uid}/leadership/mentorshipPreferences`);
      await update(preferencesRef, preferences);
      refetch();
    } catch (error) {
      console.error("Error updating mentorship preferences:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update mentorship preferences"
      });
    }
  };
  
  const handleRequestMentorship = async (mentorId: string, message: string) => {
    if (!currentUser?.uid) return;
    
    // In a real application, this would send the request to the backend
    console.log("Sending mentorship request:", { mentorId, message });
    
    // Mock successful request
    toast({
      title: "Mentorship request sent",
      description: "Your request has been sent successfully"
    });
  };

  if (isLoading) {
    return <div>Loading leadership data...</div>;
  }

  if (!profile) {
    return <div>No leadership profile available.</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="mentorship" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentorship
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <LeadershipMetrics />
            <LeadershipProgressChart metrics={profile.metrics} title="Leadership Competencies" />
          </div>
        </TabsContent>
        
        <TabsContent value="growth">
          <div className="grid gap-6 md:grid-cols-2">
            <PromotionRequirements
              currentTier={profile.currentTier}
              nextTier={nextTier}
              requirements={mockRequirements}
              currentMetrics={mockCurrentMetrics}
              onRequestPromotion={handleRequestPromotion}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Achievements</CardTitle>
                <CardDescription>Your leadership milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.achievements.map(achievement => (
                    <div key={achievement.id} className="p-3 bg-muted rounded-md">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline">{achievement.category || "leadership"}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="mentorship">
          <MentorshipConnection
            isMentor={profile.currentTier !== "emerging"}
            hasMentor={profile.mentors.length > 0}
            mentorshipPreferences={profile.mentorshipPreferences}
            onUpdatePreferences={handleUpdateMentorshipPreferences}
            onRequestMentor={handleRequestMentorship}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
